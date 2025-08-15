import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import promptpay from "promptpay-qr";

const PromptPayQR = ({ accountNumber, amount }) => {
    const [qrDataUrl, setQrDataUrl] = useState("");

    useEffect(() => {
        // สร้าง payload สำหรับ PromptPay
        const payload = promptpay(accountNumber, { amount: amount });
        
        // แปลง payload เป็นภาพ QR
        QRCode.toDataURL(payload, { width: 200 }, (err, url) => {
            if (!err) setQrDataUrl(url);
        });
    }, [accountNumber, amount]);

    return (
        <div className="flex flex-col items-center">
            {qrDataUrl && <img src={qrDataUrl} alt="PromptPay QR" />}
            <p className="mt-2 text-sm text-gray-600">
                โอน {amount} บาท ไปยัง {accountNumber}
            </p>
        </div>
    );
};

export default PromptPayQR;
