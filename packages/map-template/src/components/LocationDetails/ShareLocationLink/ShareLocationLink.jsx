import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import ClickAwayListener from 'react-click-away-listener';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import shareLinkSelector from '../../../selectors/baseLink';
import './ShareLocationLink.scss';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import { ReactComponent as ChainLinkIcon } from '../../../assets/chain-link.svg';
import { ReactComponent as QRCodeIcon } from '../../../assets/qrcode.svg';
import { ReactComponent as ShareIcon } from '../../../assets/share.svg';
import qrCodeLinkState from '../../../atoms/qrCodeLinkState';
import kioskLocationState from '../../../atoms/kioskLocationState';
import supportsUrlParametersState from '../../../atoms/supportsUrlParametersState';

ShareLocationLink.propTypes = {
    location: PropTypes.object.isRequired,
    buttonClassName: PropTypes.string
};

/**
 * A button to share a link to the location, either by copying a link or showing a QR code with the link.
 *
 * @param {object} props
 * @param {object} props.location - The location to share a link to.
 * @param {string} [props.buttonClassName] - The class name to apply to the share button.
 */
function ShareLocationLink({ location, buttonClassName }) {

    const { t } = useTranslation();
    const [shareDialogueIsOpen, setShareDialogueIsOpen] = useState(false);
    const shareLink = useRecoilValue(shareLinkSelector);
    const [locationShareLink, setLocationShareLink] = useState();
    const supportsUrlParameters = useRecoilValue(supportsUrlParametersState);
    const [showQRCodeButton, setShowQRCodeButton] = useState(false);
    const [showCopyButton, setShowCopyButton] = useState(false);
    const kioskLocation = useRecoilValue(kioskLocationState);

    const [, setQrCodeLink] = useRecoilState(qrCodeLinkState);

    const isDesktop = useIsDesktop();

    /*
     * If the share link or location changes, update the location share link with the locationId query parameter.
     */
    useEffect(() => {
        if (shareLink && location) {
            setLocationShareLink(shareLink + '&locationId=' + location.id);
        }
    }, [shareLink, location]);

    /*
     * Evaluate which action buttons to show.
     */
    useEffect(() => {
        // Generally, don't show share buttons if the Map Template is running in "kiosk mode" or is configured not to support query parameters (since in that case a query parameters will not be respected).

        setShowQRCodeButton(!kioskLocation && supportsUrlParameters && isDesktop); // the reason for the isDesktop check is that the QR code is not very useful on mobile devices.

        // Check if the browser supports writing to the clipboard.
        const canWriteToClipboard = typeof navigator.clipboard?.writeText === 'function';
        setShowCopyButton(!kioskLocation && supportsUrlParameters && canWriteToClipboard);
    }, [supportsUrlParameters, kioskLocation, isDesktop]);

    /**
     * Copy the link to the clipboard.
     */
    const copyLink = () => {
        navigator.clipboard.writeText(locationShareLink);
        setShareDialogueIsOpen(false);
    };

    /**
     * Set the QR code link state for the QR code dialog to show up.
     */
    const showQRCode = () => {
        setQrCodeLink(locationShareLink);
        setShareDialogueIsOpen(false);
    };

    return (showQRCodeButton || showCopyButton) && <div className="share-location-link">
        <button className={buttonClassName} onClick={() => setShareDialogueIsOpen(isOpen => !isOpen)} title={t('Share')} aria-label={t('Share')}>
            <ShareIcon />
        </button>

        { /* We use the ClickAwayListener to make sure that the dialogue closes when the user clicks outside/away from it. */ }
        {shareDialogueIsOpen && <ClickAwayListener onClickAway={() => setShareDialogueIsOpen(false)}>
            <ul>

                {/* Make a button to copy the link */}
                {showCopyButton &&<li>
                    <button className={buttonClassName} onClick={() => copyLink()}>
                        <ChainLinkIcon />
                        {t('Copy link')}
                    </button>
                </li>}

                {/* Make a button to show a QR code */}
                {showQRCodeButton && <li>
                    <button className={buttonClassName} onClick={() => showQRCode()}>
                        <QRCodeIcon />
                        {t('QR Code')}
                    </button>
                </li>}

            </ul>
        </ClickAwayListener>}
    </div>
}

export default ShareLocationLink;
