# SmartQR — by Bibek Singh

SmartQR is a modern, privacy-first QR toolkit for scanning and generating QR codes directly in the browser.

## Features

### Scan QR

- Live camera scanning with automatic detection
- Front/rear camera switching and flashlight support where available
- Optimized frame processing and duplicate-scan prevention
- Upload and drag-and-drop image scanning
- Smart result classification for links, Wi-Fi, contacts, email, phone, and text
- Open, copy, share, or download scan results
- Local recent scan history

### Generate QR

- Generate QR codes from links, text, Wi-Fi strings, and email content
- Preset examples for Website, Wi-Fi, and Email
- Custom QR and background colors
- Adjustable output size from 180px to 640px
- High-error-correction output suitable for sharing and printing
- Download as PNG or copy the original content

## Privacy

Camera frames, uploaded images, and generated data are processed locally in the browser. No application backend receives your content. The scanner uses jsQR and the generator uses QRious from jsDelivr.

## Run locally

Camera access requires a secure context. Start a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
