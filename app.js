const $ = (id) => document.getElementById(id);
const video = $('video');
const canvas = $('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let stream = null;
let animationId = null;
let currentValue = '';

function showError(message) { const el = $('errorMessage'); el.textContent = message; el.hidden = false; }
function clearError() { $('errorMessage').hidden = true; }
function stopCamera() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  video.srcObject = null;
  $('cameraStatus').hidden = true;
  $('stopCamera').hidden = true;
  $('scanFrame').hidden = true;
}
function displayResult(value) {
  currentValue = value;
  $('resultValue').textContent = value;
  const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(value.trim());
  const link = $('openResult');
  link.hidden = !looksLikeUrl;
  link.href = looksLikeUrl ? (value.trim().startsWith('www.') ? `https://${value.trim()}` : value.trim()) : '#';
  $('resultPanel').hidden = false;
  $('cameraPanel').hidden = true;
  $('uploadPanel').hidden = true;
  stopCamera();
}
function resetScanner() {
  currentValue = '';
  $('resultPanel').hidden = true;
  clearError();
  if ($('cameraMode').classList.contains('active')) { $('cameraPanel').hidden = false; $('cameraPlaceholder').hidden = false; }
  else $('uploadPanel').hidden = false;
}
function scanFrame() {
  if (!stream || video.readyState < 2) { animationId = requestAnimationFrame(scanFrame); return; }
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = window.jsQR && jsQR(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
  if (code && code.data) { displayResult(code.data); return; }
  animationId = requestAnimationFrame(scanFrame);
}
async function startCamera() {
  clearError();
  if (!navigator.mediaDevices?.getUserMedia) { showError('Camera access is not supported by this browser. Try uploading an image instead.'); return; }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    video.srcObject = stream;
    await video.play();
    $('cameraPlaceholder').hidden = true;
    $('scanFrame').hidden = false;
    $('cameraStatus').hidden = false;
    $('stopCamera').hidden = false;
    animationId = requestAnimationFrame(scanFrame);
  } catch (error) {
    showError(error.name === 'NotAllowedError' ? 'Camera permission was denied. Please allow camera access or upload an image.' : 'We could not start the camera. Please try again or upload an image.');
  }
}
function activateMode(mode) {
  const camera = mode === 'camera';
  stopCamera(); clearError(); $('resultPanel').hidden = true;
  $('cameraMode').classList.toggle('active', camera); $('uploadMode').classList.toggle('active', !camera);
  $('cameraMode').setAttribute('aria-selected', camera); $('uploadMode').setAttribute('aria-selected', !camera);
  $('cameraPanel').hidden = !camera; $('uploadPanel').hidden = camera;
  if (camera) $('cameraPlaceholder').hidden = false;
}
async function decodeFile(file) {
  clearError();
  if (!file || !file.type.startsWith('image/')) return showError('Please choose a PNG, JPG, WEBP, or GIF image.');
  if (file.size > 10 * 1024 * 1024) return showError('That image is larger than 10 MB. Please choose a smaller file.');
  const url = URL.createObjectURL(file);
  $('previewImage').src = url; $('imagePreview').hidden = false; $('dropZone').hidden = true;
  const image = new Image();
  image.onload = () => { canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; ctx.drawImage(image, 0, 0); const data = ctx.getImageData(0, 0, canvas.width, canvas.height); const code = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' }); if (code?.data) displayResult(code.data); else showError('No QR code found in that image. Try a clearer, well-lit image.'); URL.revokeObjectURL(url); };
  image.onerror = () => showError('That image could not be read.'); image.src = url;
}
$('startCamera').addEventListener('click', startCamera);
$('stopCamera').addEventListener('click', () => { stopCamera(); $('cameraPlaceholder').hidden = false; });
$('cameraMode').addEventListener('click', () => activateMode('camera'));
$('uploadMode').addEventListener('click', () => activateMode('upload'));
$('fileInput').addEventListener('change', e => decodeFile(e.target.files[0]));
$('dropZone').addEventListener('dragover', e => { e.preventDefault(); $('dropZone').classList.add('dragover'); });
$('dropZone').addEventListener('dragleave', () => $('dropZone').classList.remove('dragover'));
$('dropZone').addEventListener('drop', e => { e.preventDefault(); $('dropZone').classList.remove('dragover'); decodeFile(e.dataTransfer.files[0]); });
$('clearImage').addEventListener('click', () => { $('fileInput').value = ''; $('imagePreview').hidden = true; $('dropZone').hidden = false; clearError(); });
$('scanAgain').addEventListener('click', () => { $('fileInput').value = ''; $('imagePreview').hidden = true; $('dropZone').hidden = false; resetScanner(); });
$('copyResult').addEventListener('click', async () => { try { await navigator.clipboard.writeText(currentValue); $('copyResult').textContent = 'Copied!'; setTimeout(() => $('copyResult').textContent = 'Copy text', 1500); } catch { showError('Copy is unavailable in this browser.'); } });
window.addEventListener('pagehide', stopCamera);
