# SmartQR — by Bibek Singh

SmartQR is a modern, privacy-first QR toolkit for scanning and generating QR codes directly in the browser.

It works as both a responsive **website** and an installable **app-style PWA**. On supported browsers, use the **Install app** button or the browser's install option to add SmartQR to your home screen. The app shell is cached for offline launch; camera scanning and external QR libraries still require the relevant browser/device capabilities.

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

- Generate QR codes from arbitrary text, long links, Wi-Fi strings, email content, and contact details
- Supports up to 3,000 characters with a clear capacity warning
- Preset examples for Website, Wi-Fi, and Email
- Custom QR and background colors
- Adjustable output size from 180px to 640px
- High-error-correction output suitable for sharing and printing
- Download as PNG or copy the original content

### Image upload

The Scan QR → Upload image mode includes a dedicated **Choose image** button as well as drag-and-drop. It accepts PNG, JPG, WEBP, and GIF images up to 10 MB and decodes them locally.

## Privacy

Camera frames, uploaded images, and generated data are processed locally in the browser. No application backend receives your content. The jsQR and QRious libraries are bundled locally so the installed app can generate and scan without waiting for a CDN.

## Run locally

Camera access requires a secure context. Start a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
