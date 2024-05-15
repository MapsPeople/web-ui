import React, { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import './QRCodeDialog.scss';
import showQRCodeDialogState from "../../atoms/showQRCodeDialogState";
import primaryColorState from "../../atoms/primaryColorState";
import apiKeyState from "../../atoms/apiKeyState";
import currentLocationState from "../../atoms/currentLocationState";
import QRCode from 'qrcode';
import kioskLocationState from "../../atoms/kioskLocationState";
import logoState from "../../atoms/logoState";
import mapboxAccessTokenState from "../../atoms/mapboxAccessTokenState";
import gmApiKeyState from "../../atoms/gmApiKeyState";

/**
 * Handle the QR Code dialog.
 *
 */
function QRCodeDialog() {
    const { t } = useTranslation();
    const [, setShowQRCodeDialog] = useRecoilState(showQRCodeDialogState);
    const elementRef = useRef()

    const primaryColorProp = useRecoilValue(primaryColorState);
    const apiKeyProp = useRecoilValue(apiKeyState);
    const logoProp = useRecoilValue(logoState);
    const gmApiKeyProp = useRecoilValue(gmApiKeyState);
    const mapboxAccessTokenProp = useRecoilValue(mapboxAccessTokenState);

    const directionsFrom = useRecoilValue(kioskLocationState);
    const directionsTo = useRecoilValue(currentLocationState);

    useEffect(() => {
        if (directionsFrom && directionsTo) {
            // Get the last character of the pathname
            // Create the target URL when the user opens the QR code dialog
            // Replace the '/' at the end of the line
            let targetUrl = window.location.origin + window.location.pathname.replace(/\/$/, "");
            
            // The interface for the existing URL search params
            const currentParams = new URLSearchParams(window.location.search);

            // The interface for the new URL search params
            const newParams = new URLSearchParams();

            /**
             * Handle the presence of query parameters and props
             * and append them to the newParams interface.
             */
            [['gmApiKey', gmApiKeyProp],
            ['mapboxAccessToken', mapboxAccessTokenProp],
            ['apiKey', apiKeyProp],
            ['primaryColor', primaryColorProp],
            ['logo', logoProp]]
                .forEach(([queryParam, prop]) => {
                    if (currentParams.has(queryParam)) {
                        const queryParameter = currentParams.get(queryParam);
                        newParams.append(queryParam, queryParameter);
                    } else if (prop) {
                        if (prop === primaryColorProp) {
                            newParams.append(queryParam, primaryColorProp.replace("#", ""));
                        } else {
                            newParams.append(queryParam, prop);
                        }
                    }
                });

            // Get the string with all the final query parameters
            const finalParams = newParams.toString();

            // Construct the QR code URL
            let QRCodeURL = `${targetUrl}?${finalParams}&directionsFrom=${directionsFrom.id}&directionsTo=${directionsTo.id}`;

            const options = {
                errorCorrectionLevel: 'L',
                margin: 0,
                width: '225'
            };

            QRCode.toDataURL(QRCodeURL, options)
                .then((dataUrl) => {
                    elementRef.current.src = dataUrl;
                });
        }

    }, [directionsFrom, directionsTo]);

    return (<>
        <div className="background"></div>
        <div className="qr-code">
            <img alt="" className="qr-code__image" ref={elementRef} />
            <p>{t('Scan the QR code to see the route on your phone')}</p>
            <button className="qr-code__button" style={{ background: primaryColorProp }} onClick={() => setShowQRCodeDialog(false)}>{t('Done')}</button>
        </div>
    </>
    )
}

export default QRCodeDialog;