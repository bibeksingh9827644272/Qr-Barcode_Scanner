import cv2
from pyzbar.pyzbar import decode
import tkinter as tk
from PIL import Image, ImageTk
import webbrowser


class QRScanner:

    def __init__(self, root):

        self.root = root
        self.root.title("QR Code Scanner App")
        self.root.geometry("1000x700")

        self.cap = None
        self.running = False
        self.qr_data = ""

        # Camera display
        self.video_label = tk.Label(root)
        self.video_label.pack(pady=80)

        # Result text
        self.result_text = tk.StringVar()
        self.result_text.set(" QR Code detect")

        result_label = tk.Label(
            root,
            textvariable=self.result_text,
            font=("Arial",20),
            fg="blue",
            wraplength=800
        )
        result_label.pack(pady=10)

        # Buttons
        btn_frame = tk.Frame(root)
        btn_frame.pack(pady=10)

        start_btn = tk.Button(
            btn_frame,
            text="Start Camera",
            command=self.start_camera,
            width=15,
            bg="green",
            fg="blue"
        )
        start_btn.grid(row=0,column=0,padx=10)

        stop_btn = tk.Button(
            btn_frame,
            text="Stop Camera",
            command=self.stop_camera,
            width=15,
            bg="red",
            fg="green"
        )
        stop_btn.grid(row=0,column=1,padx=10)

        open_btn = tk.Button(
            root,
            text="Open Link",
            command=self.open_link,
            width=20,
            bg="blue",
            fg="red"
        )
        open_btn.pack(pady=10)


    def start_camera(self):
           
        if not self.running:
            self.cap = cv2.VideoCapture(0)
            self.running = True
            self.scan_qr()


    def stop_camera(self):

        self.running = False
        if self.cap:
            self.cap.release()


    def scan_qr(self):

        if self.running:

            ret, frame = self.cap.read()

            if ret:

                qr_codes = decode(frame)

                for qr in qr_codes:

                    x, y, w, h = qr.rect

                    cv2.rectangle(
                        frame,
                        (x,y),
                        (x+w,y+h),
                        (0,255,0),
                        3
                    )

                    self.qr_data = qr.data.decode("utf-8")

                    self.result_text.set("Detected: " + self.qr_data)

                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                img = Image.fromarray(frame)
                img = img.resize((800,450))

                imgtk = ImageTk.PhotoImage(img)

                self.video_label.imgtk = imgtk
                self.video_label.configure(image=imgtk)

            self.video_label.after(10,self.scan_qr)


    def open_link(self):

        if self.qr_data.startswith("http"):
            webbrowser.open(self.qr_data)


# Run application
root = tk.Tk()
app = QRScanner(root)
root.mainloop()