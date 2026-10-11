const $ = (id) => document.getElementById(id);
const video = $('video');
const canvas = $('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const HISTORY_KEY = 'smartqr-history-v1';
let stream = null;
let scanTimer = null;
let currentValue = '';
let facingMode = 'environment';
let scanCount = 0;
let lastScanTick = performance.now();
let lastValue = '';
let duplicateBlockedUntil = 0;
let qrCode = null;

const getHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveHistory = (items) => localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 20)));
const isUrl = (value) => /^(https?:\/\/|www\.)/i.test(value.trim());
const resultKind = (value) => { const text = value.trim(); if (isUrl(text)) return 'LINK DETECTED'; if (/^(WIFI:|BEGIN:WIFI)/i.test(text)) return 'WI-FI CODE'; if (/^(BEGIN:VCARD|MECARD:)/i.test(text)) return 'CONTACT CARD'; if (/^mailto:/i.test(text)) return 'EMAIL ADDRESS'; if (/^tel:/i.test(text)) return 'PHONE NUMBER'; return 'TEXT CONTENT'; };

function showError(message) { const el = $('errorMessage'); el.textContent = message; el.hidden = false; }
function clearError() { $('errorMessage').hidden = true; }
function renderHistory() {
  const items = getHistory(); const section = $('historySection'); const list = $('historyList');
  section.hidden = !items.length; list.innerHTML = '';
  items.forEach((item, index) => { const row = document.createElement('article'); row.className = 'history-item'; row.innerHTML = `<span class="history-type">${escapeHtml(item.kind)}</span><button class="history-value" title="Use this result">${escapeHtml(item.value)}</button><time>${escapeHtml(item.time)}</time><button class="history-copy" title="Copy result">Copy</button>`; row.querySelector('.history-value').addEventListener('click', () => displayResult(item.value, false)); row.querySelector('.history-copy').addEventListener('click', () => copyText(item.value, row.querySelector('.history-copy'))); list.appendChild(row); });
}
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function addToHistory(value) { const clean = value.trim(); const items = getHistory().filter(item => item.value !== clean); items.unshift({ value: clean, kind: resultKind(clean), time: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date()) }); saveHistory(items); renderHistory(); }
function stopCamera() {
  if (scanTimer) clearInterval(scanTimer); scanTimer = null;
  if (stream) stream.getTracks().forEach(track => track.stop()); stream = null; video.srcObject = null;
  $('cameraStatus').hidden = true; $('cameraControls').hidden = true; $('scanFrame').hidden = true; $('toggleTorch').hidden = true;
}
function resetScanner() { currentValue = ''; lastValue = ''; $('resultPanel').hidden = true; clearError(); if ($('cameraMode').classList.contains('active')) { $('cameraPanel').hidden = false; $('cameraPlaceholder').hidden = false; } else $('uploadPanel').hidden = false; }
function displayResult(value, save = true) {
  const clean = value.trim(); if (!clean) return;
  currentValue = clean; if (save) addToHistory(clean); $('resultValue').textContent = clean; $('resultType').textContent = resultKind(clean);
  const link = $('openResult'); const linkLike = isUrl(clean); link.hidden = !linkLike; link.href = linkLike ? (clean.startsWith('www.') ? `https://${clean}` : clean) : '#';
  $('resultPanel').hidden = false; $('cameraPanel').hidden = true; $('uploadPanel').hidden = true; stopCamera();
}
function scanFrame() {
  if (!stream || video.readyState < 2 || !window.jsQR) return;
  const maxWidth = 960; const scale = Math.min(1, maxWidth / video.videoWidth); canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height); const image = ctx.getImageData(0, 0, canvas.width, canvas.height); const code = jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
  scanCount++; const now = performance.now(); if (now - lastScanTick > 1000) { $('scanFps').textContent = `${scanCount} fps`; scanCount = 0; lastScanTick = now; }
  if (code?.data && (code.data !== lastValue || now > duplicateBlockedUntil)) { lastValue = code.data; duplicateBlockedUntil = now + 2500; displayResult(code.data); }
}
async function startCamera() {
  clearError(); stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) return showError('Camera access is not supported here. Try uploading an image instead.');
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode }, width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, frameRate: { ideal: 30, max: 30 } }, audio: false });
    video.srcObject = stream; await video.play(); $('cameraPlaceholder').hidden = true; $('scanFrame').hidden = false; $('cameraStatus').hidden = false; $('cameraControls').hidden = false;
    const track = stream.getVideoTracks()[0]; const capabilities = track.getCapabilities?.(); if (capabilities?.torch) $('toggleTorch').hidden = false;
    scanCount = 0; lastScanTick = performance.now(); scanTimer = setInterval(scanFrame, 120);
  } catch (error) { showError(error.name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access, then try again.' : 'We could not start the camera. Check that it is not being used by another app.'); }
}
async function switchCamera() { facingMode = facingMode === 'environment' ? 'user' : 'environment'; await startCamera(); }
async function toggleTorch() { const track = stream?.getVideoTracks()[0]; if (!track) return; const current = track.getSettings?.().torch === true; try { await track.applyConstraints({ advanced: [{ torch: !current }] }); $('toggleTorch').classList.toggle('on', !current); } catch { showError('The flashlight is not available on this camera.'); } }
function activateMode(mode) { const camera = mode === 'camera'; stopCamera(); clearError(); $('resultPanel').hidden = true; $('cameraMode').classList.toggle('active', camera); $('uploadMode').classList.toggle('active', !camera); $('cameraMode').setAttribute('aria-selected', camera); $('uploadMode').setAttribute('aria-selected', !camera); $('cameraPanel').hidden = !camera; $('uploadPanel').hidden = camera; if (camera) $('cameraPlaceholder').hidden = false; }
async function decodeFile(file) {
  clearError(); if (!file || !file.type.startsWith('image/')) return showError('Please choose a PNG, JPG, WEBP, or GIF image.'); if (file.size > 10 * 1024 * 1024) return showError('That image is larger than 10 MB.');
  const url = URL.createObjectURL(file); $('previewImage').src = url; $('imagePreview').hidden = false; $('dropZone').hidden = true;
  const image = new Image(); image.onload = () => { const max = 1800; const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight)); canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale)); ctx.drawImage(image, 0, 0, canvas.width, canvas.height); const data = ctx.getImageData(0, 0, canvas.width, canvas.height); const code = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' }); if (code?.data) displayResult(code.data); else showError('No QR code found. Try a sharper image with the code fully visible.'); URL.revokeObjectURL(url); }; image.onerror = () => showError('That image could not be read.'); image.src = url;
}
async function copyText(value, button = $('copyResult')) { try { await navigator.clipboard.writeText(value); const old = button.textContent; button.textContent = 'Copied!'; setTimeout(() => button.textContent = old, 1500); } catch { showError('Copy is unavailable in this browser.'); } }
async function shareResult() { if (!currentValue) return; if (navigator.share) { try { await navigator.share({ title: 'Scanned QR code', text: currentValue }); } catch {} } else copyText(currentValue, $('shareResult')); }
function downloadResult() { const blob = new Blob([currentValue], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `smartqr-result-${Date.now()}.txt`; a.click(); URL.revokeObjectURL(a.href); }

function setModule(module) {
  const scanner = module === 'scanner';
  if (!scanner) stopCamera();
  $('scannerModule').classList.toggle('active', scanner); $('generatorModule').classList.toggle('active', !scanner);
  $('scannerModule').setAttribute('aria-selected', scanner); $('generatorModule').setAttribute('aria-selected', !scanner);
  $('scannerSection').hidden = !scanner; $('generatorSection').hidden = scanner;
  if (scanner) { $('cameraPanel').hidden = false; $('uploadPanel').hidden = true; $('resultPanel').hidden = true; }
}
function generateQrCode() {
  const value = $('qrInput').value.trim(); const status = $('generatorStatus');
  if (!value) { status.textContent = 'Add some text or a link first.'; status.className = 'generator-status warning'; return; }
  if (!window.QRious) { status.textContent = 'Generator is still loading. Try again in a moment.'; status.className = 'generator-status warning'; return; }
  const size = Number($('qrSize').value); qrCode = new QRious({ element: $('qrCanvas'), value, size, level: 'H', foreground: $('qrForeground').value, background: $('qrBackground').value, padding: 12 });
  $('qrEmpty').hidden = true; $('downloadQr').disabled = false; $('copyQrText').disabled = false; status.textContent = 'Your QR code is ready to share.'; status.className = 'generator-status success';
}
function downloadQrCode() { if (!qrCode) return; const a = document.createElement('a'); a.download = `smartqr-${Date.now()}.png`; a.href = $('qrCanvas').toDataURL('image/png'); a.click(); }

$('scannerModule').addEventListener('click', () => setModule('scanner')); $('generatorModule').addEventListener('click', () => setModule('generator')); $('startCamera').addEventListener('click', startCamera); $('stopCamera').addEventListener('click', () => { stopCamera(); $('cameraPlaceholder').hidden = false; }); $('switchCamera').addEventListener('click', switchCamera); $('toggleTorch').addEventListener('click', toggleTorch); $('cameraMode').addEventListener('click', () => activateMode('camera')); $('uploadMode').addEventListener('click', () => activateMode('upload')); $('fileInput').addEventListener('change', e => decodeFile(e.target.files[0]));
$('dropZone').addEventListener('dragover', e => { e.preventDefault(); $('dropZone').classList.add('dragover'); }); $('dropZone').addEventListener('dragleave', () => $('dropZone').classList.remove('dragover')); $('dropZone').addEventListener('drop', e => { e.preventDefault(); $('dropZone').classList.remove('dragover'); decodeFile(e.dataTransfer.files[0]); });
$('clearImage').addEventListener('click', () => { $('fileInput').value = ''; $('imagePreview').hidden = true; $('dropZone').hidden = false; clearError(); }); $('scanAgain').addEventListener('click', () => { $('fileInput').value = ''; $('imagePreview').hidden = true; $('dropZone').hidden = false; resetScanner(); }); $('copyResult').addEventListener('click', () => copyText(currentValue)); $('shareResult').addEventListener('click', shareResult); $('downloadResult').addEventListener('click', downloadResult); $('clearHistory').addEventListener('click', () => { localStorage.removeItem(HISTORY_KEY); renderHistory(); }); window.addEventListener('pagehide', stopCamera); renderHistory();
$('generateQr').addEventListener('click', generateQrCode); $('downloadQr').addEventListener('click', downloadQrCode); $('copyQrText').addEventListener('click', () => copyText($('qrInput').value, $('copyQrText'))); $('qrSize').addEventListener('input', () => { $('sizeValue').textContent = `${$('qrSize').value}px`; if (qrCode) generateQrCode(); }); $('qrForeground').addEventListener('input', () => { if (qrCode) generateQrCode(); }); $('qrBackground').addEventListener('input', () => { if (qrCode) generateQrCode(); }); document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => { $('qrInput').value = chip.dataset.example; generateQrCode(); })); window.addEventListener('pagehide', stopCamera); renderHistory();
