# Scanly — QR Code Scanner

A modern, responsive QR code scanner that runs entirely in the browser. It supports live camera scanning and QR decoding from uploaded images, with URL detection, copy actions, and privacy-first local processing.

## Features

- Live camera scanning using `getUserMedia`
- Image upload and drag-and-drop support
- QR decoding powered by [jsQR](https://github.com/cozmo/jsQR)
- URL detection with one-click open action
- Copy scanned text to clipboard
- Responsive layout for mobile, tablet, and desktop
- No backend and no image uploads — processing stays on the device

## Run locally

Because camera APIs require a secure context, use a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The site is deployed automatically to GitHub Pages from the `main` branch using the workflow in `.github/workflows/deploy.yml`.

## Privacy

Camera frames and uploaded images are decoded locally in the browser. They are not sent to a server by this project. The jsQR library is loaded from jsDelivr.
