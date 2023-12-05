import React, { useEffect } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import './QRCodeDialog.scss';
import showQRCodeDialogState from "../../atoms/showQRCodeDialogState";
import primaryColorState from "../../atoms/primaryColorState";
import apiKeyState from "../../atoms/apiKeyState";
import currentLocationState from "../../atoms/currentLocationState";
import QRCode from 'qrcode';
import kioskLocationState from "../../atoms/kioskLocationState";
import logoState from "../../atoms/logoState";

function QRCodeDialog() {

    const [, setShowQRCodeDialog] = useRecoilState(showQRCodeDialogState);
    const primaryColor = useRecoilValue(primaryColorState);
    const apiKey = useRecoilValue(apiKeyState);
    const directionsFrom = useRecoilValue(kioskLocationState);
    const directionsTo = useRecoilValue(currentLocationState);
    const logo = useRecoilValue(logoState);


    useEffect(() => {
        if (directionsFrom && directionsTo) {
            let QRCodeURL;

            let currentUrl = window.location.origin;
            const currentParams = new URLSearchParams(window.location.search);

            const newParams = new URLSearchParams();

            // Check if the mapboxAccessToken exists as a parameter
            if (currentParams.has('mapboxAccessToken')) {
                const mapboxAccessTokenParameter = currentParams.get('mapboxAccessToken');
                newParams.append('mapboxAccessToken', mapboxAccessTokenParameter);
            }

            // Check if the gmApiKey exists as a parameter
            if (currentParams.has('gmApiKey')) {
                const gmApiKeyParameter = currentParams.get('gmApiKey');
                newParams.append('gmApiKey', gmApiKeyParameter);
            }

            // Check if the apiKey exists as a parameter
            if (currentParams.has('apiKey')) {
                const apiKeyParameter = currentParams.get('apiKey');
                newParams.append('apiKey', apiKeyParameter);
                //Else just take the apiKey prop
            } else {
                const apiKeyParameter = apiKey;
                newParams.append('apiKey', apiKeyParameter);
            }

            // Check for primary color query parameter
            if (currentParams.has('primaryColor')) {
                const primaryColorParameter = currentParams.get('primaryColor')
                newParams.append('primaryColor', primaryColorParameter)
                // Check for primary color property 
                // Remove the "#" character from the hex code
            } else if (primaryColor) {
                newParams.append('primaryColor', primaryColor.replace("#", ""))
            }

            // Check for logo query parameter
            if (currentParams.has('logo')) {
                const logoParameter = currentParams.get('logo')
                newParams.append('logo', logoParameter)
                // Check for logo property
            } else if (logo) {
                newParams.append('logo', logo)
            }

            const finalParams = newParams.toString()

            QRCodeURL = `${currentUrl}/?${finalParams}&directionsFrom=${directionsFrom.id}&directionsTo=${directionsTo.id}`
            console.log('qr code', QRCodeURL)

            const options = {
                errorCorrectionLevel: 'L',
                margin: 0,
                width: '225'
            };

            QRCode.toDataURL(QRCodeURL, options)
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