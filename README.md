# Scanly — QR Code Scanner

A fast, privacy-first QR code scanner that runs in the browser. It handles live camera scans and uploaded images, then gives you useful actions for the result.

## Features

- Live camera scanning with automatic QR detection
- Rear/front camera switching on supported devices
- Flashlight/torch toggle on supported mobile cameras
- Optimized frame processing with capped camera resolution
- Image upload and drag-and-drop support
- Downscaled image decoding for large photos
- Smart result classification for links, Wi-Fi, contacts, email, phone, and text
- Open links, copy, share, or download scan results
- Local scan history with one-click re-open, copy, and clear-all
- Responsive mobile, tablet, and desktop layout
- No backend and no image uploads — processing stays on the device

## Run locally

Camera APIs require a secure context. Use a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Privacy

Camera frames and uploaded images are decoded locally in the browser. They are not sent to a server by this project. The jsQR library is loaded from jsDelivr.
