🏷️ PROJECT TITLE
📱 Barcode and QR Code Scanner


Live Barcode and QR Code Scanner

📖 INTRODUCTION

This project is a Python-based application that performs QR code and barcode scanning tasks. It detects, scans, and displays the encoded information using a webcam. Additionally, it can open links directly in the browser and generate QR codes from user input.

The entire project is designed to run in a local environment, ensuring proper access to the system camera.

🎯 PURPOSE

QR codes and barcodes are widely used to store information in a compact and machine-readable format. This project demonstrates how we can:

Decode hidden information inside QR/Barcodes
Build our own scanner using Python
Understand real-world applications of computer vision

The project was developed using Python libraries and executed using tools like VS Code and Git Bash.

🧠 BRIEF EXPLANATION

QR and barcode readers work by capturing an image and decoding patterns into meaningful data.

For example:

When you point your phone camera at a QR code, it automatically detects and shows a link.
Similarly, this project uses a webcam to scan and decode QR codes in real time.
⚙️ WORKING CONDITIONS
🔹 Setting up the Environment
Use a local system (recommended)
Webcam must be available
Install required Python libraries
🔹 Importing Required Packages

The project uses multiple libraries for image processing and decoding:

OpenCV → Camera handling
Pyzbar → QR/Barcode decoding
Tkinter → GUI
Pillow → Image processing
qrcode → QR generation
🔹 Decoding Function
Detects QR/Barcode from camera frame
Extracts encoded data
Displays detected result on screen
Optionally opens links in browser

📌 Code reference:

🔹 QR Generator Function
Takes input from user
Converts it into QR format
Saves as image file

📌 Code reference:

🔹 Main Function
Starts webcam using OpenCV
Continuously scans frames
Calls decoding function
Updates GUI in real time
🔹 Testing
Run the scanner
Show QR/Barcode to camera
Output will be displayed instantly
▶️ USAGE
🔸 Run QR Generator
python qr_generator.py
🔸 Run QR Scanner
python scanner.py
🎮 Controls
Start Camera
Stop Camera
Open Link
