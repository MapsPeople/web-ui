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

/**
 * Handle the QR Code dialog.
 *
 */
function QRCodeDialog() {
    const [, setShowQRCodeDialog] = useRecoilState(showQRCodeDialogState);

    const primaryColorProp = useRecoilValue(primaryColorState);
    const apiKeyProp = useRecoilValue(apiKeyState);
    const logoProp = useRecoilValue(logoState);

    const directionsFrom = useRecoilValue(kioskLocationState);
    const directionsTo = useRecoilValue(currentLocationState);

    useEffect(() => {
        if (directionsFrom && directionsTo) {
            // The target URL when the user opens the QR code dialog
            let targetUrl = window.location.origin;

            // The interface for the existing URL search params
            const currentParams = new URLSearchParams(window.location.search);

            // The interface for the new URL search params
            const newParams = new URLSearchParams();

            /**
             * Function that handles the presence of query parameters
             * and appends them to the newParams interface.
             * 
             * @param {string} queryParam 
             * @param {string} prop 
             */
            function handleQueryParams(queryParam) {
                if (currentParams.has(queryParam)) {
                    const queryParameter = currentParams.get(queryParam);
                    newParams.append(queryParam, queryParameter);
                }
            }

            /**
             * Function that handles the presence of query parameters and props
             * and appends them to the newParams interface.
             * 
             * @param {string} queryParam 
             * @param {string} prop 
             */
            function handleQueryParamsAndProps(queryParam, prop) {
                if (currentParams.has(queryParam)) {
                    const queryParameter = currentParams.get(queryParam);
                    newParams.append(queryParam, queryParameter);
                } else if (prop) {
                    if (prop === primaryColorProp) {
                        newParams.append(queryParam, primaryColorProp.replace("#", ""))
                    } else {
                        newParams.append(queryParam, prop)
                    }
                }
            }

            // Handle query parameters for the gmApiKey and mapboxAccessToken
            handleQueryParams('gmApiKey');
            handleQueryParams('mapboxAccessToken');

            // Handle query parameters and props for apiKey, primaryColor, logo 
            handleQueryParamsAndProps('apiKey', apiKeyProp);
            handleQueryParamsAndProps('primaryColor', primaryColorProp);
            handleQueryParamsAndProps('logo', logoProp);

            // Get the string with all the final query parameters
            const finalParams = newParams.toString()

            // Construct the QR code URL
            let QRCodeURL = `${targetUrl}/?${finalParams}&directionsFrom=${directionsFrom.id}&directionsTo=${directionsTo.id}`

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
            <button className="qr-code__button" style={{ background: primaryColorProp }} onClick={() => closeDialog()}>Done</button>
        </div>
    </>
    )
}

export default QRCodeDialog;