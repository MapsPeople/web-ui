import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import './QRCodeDialog.scss';
import showQRCodeDialogState from "../../atoms/showQRCodeDialogState";
import primaryColorState from "../../atoms/primaryColorState";
import apiKeyState from "../../atoms/apiKeyState";
import venuesState from "../../atoms/venuesState";
import currentLocationState from "../../atoms/currentLocationState";
import QRCode from 'qrcode';
import kioskLocationState from "../../atoms/kioskLocationState";

function QRCodeDialog() {

    const [, setShowQRCodeDialog] = useRecoilState(showQRCodeDialogState);
    const primaryColor = useRecoilValue(primaryColorState);
    const apiKey = useRecoilValue(apiKeyState);
    const venue = useRecoilValue(venuesState);
    const directionsFrom = useRecoilValue(currentLocationState);
    const directionsTo = useRecoilValue(kioskLocationState);

    useEffect(() => {
        if (directionsFrom && directionsTo) {
            console.log(directionsTo, directionsFrom)
            const appUrl = `https://map.mapsindoors.com/?apiKey=${apiKey}&venue=${venue}&directionsFrom=${directionsTo.id}&directionsTo=${directionsFrom.id}`;
            const options = {
                errorCorrectionLevel: 'L',
                margin: 0,
                width: '225'
            };

            QRCode.toDataURL(appUrl, options)
                .then((dataUrl) => {
                    document.getElementById('qr').src = dataUrl;
                }).catch(() => {
                    console.log('error')
                });
        }

    }, [directionsFrom, directionsTo])


    function closeDialog() {
        setShowQRCodeDialog(false);
    }
    return (<>
        <div className="background"></div>
        <div className="qr-code">
            <img id='qr' alt="QR Code" className="qr-code__image" />
            <p>Scan the QR code to see the route on your phone</p>
            <button className="qr-code__button" style={{ background: primaryColor }} onClick={() => closeDialog()}>DONE</button>
        </div>
    </>
    )
}

export default QRCodeDialog;