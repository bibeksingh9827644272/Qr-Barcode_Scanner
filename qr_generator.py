import qrcode

data = input("Enter text, URL, or anything: ")

qr = qrcode.QRCode(  
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4
)

qr.add_data(data)
qr.make(fit=True)

img = qr.make_image(fill_color="black", back_color="white")

img.save("my_qr_code.png")

print("QR Code saved as my_qr_code.png")