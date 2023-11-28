import React from "react";
import { useRecoilState } from 'recoil';
import './QRCode.scss';
import showQRCodeDialogState from "../../atoms/showQRCodeDialogState";

function QRCode() {

    const [, setShowQRCodeDialog] = useRecoilState(showQRCodeDialogState);

    function closeDialog() {
        setShowQRCodeDialog(false);
    }
    return (
        <div className="qr-code">
            This is QR Code
            <button className="close" onClick={() => closeDialog()}></button>
        </div>
    )
}

export default QRCode;