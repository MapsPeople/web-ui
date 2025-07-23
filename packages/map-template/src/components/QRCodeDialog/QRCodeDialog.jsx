import { useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import './QRCodeDialog.scss';
import qrCodeLinkState from '../../atoms/qrCodeLinkState';
import primaryColorState from '../../atoms/primaryColorState';
import QRCode from 'qrcode';

/**
 * Based on the qrCodeLinkState show a QR code dialog.
 */
function QRCodeDialog() {
    const { t } = useTranslation();
    const [QRCodeLink, setQRCodeLink] = useRecoilState(qrCodeLinkState);
    const elementRef = useRef()

    const primaryColor = useRecoilValue(primaryColorState);

    useEffect(() => {
        const options = {
            errorCorrectionLevel: 'L',
            margin: 0,
            width: '225'
        };

        QRCode.toDataURL(QRCodeLink, options)
            .then((dataUrl) => {
                elementRef.current.src = dataUrl;
            });
    }, [primaryColor, QRCodeLink]);

    return (<>
        <div className="background"></div>
        <div className="qr-code">
            <img alt="" className="qr-code__image" ref={elementRef} />
            <p>{t('Scan the QR code to see the route on your phone')}</p>
            <button className="qr-code__button" style={{ background: primaryColor }} onClick={() => setQRCodeLink(null)}>{t('Done')}</button>
        </div>
    </>
    )
}

export default QRCodeDialog;