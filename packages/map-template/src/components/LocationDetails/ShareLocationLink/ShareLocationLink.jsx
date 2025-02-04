import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import ClickAwayListener from 'react-click-away-listener';
import PropTypes from 'prop-types';
import shareLinkSelector from '../../../selectors/baseLink';
import './ShareLocationLink.scss';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import { ReactComponent as ChainLinkIcon } from '../../../assets/chain-link.svg';
import { ReactComponent as QRCodeIcon } from '../../../assets/qrcode.svg';
import { ReactComponent as ShareIcon } from '../../../assets/share.svg';
import qrCodeLinkState from '../../../atoms/qrCodeLinkState';
import supportsUrlParametersState from '../../../atoms/supportsUrlParametersState';

ShareLocationLink.propTypes = {
    location: PropTypes.object.isRequired,
    buttonClassName: PropTypes.string
};

/**
 * A button to share a link to the location, either by copying a link it or showing a QR code with the link.
 *
 * @param {object} props
 * @param {object} props.location - The location to share a link to.
 * @param {string} [props.buttonClassName] - The class name to apply to the share button.
 */
function ShareLocationLink({ location, buttonClassName }) {

    const [shareDialogueIsOpen, setShareDialogueIsOpen] = useState(false);
    const shareLink = useRecoilValue(shareLinkSelector);
    const [locationShareLink, setLocationShareLink] = useState();
    const supportsUrlParameters = useRecoilValue(supportsUrlParametersState);

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

    /**
     * Copy the link to the clipboard.
     */
    const copyLink = () => {
        navigator.clipboard?.writeText(locationShareLink);
        setShareDialogueIsOpen(false);
    };

    /**
     * Set the QR code link state for the QR code dialog to show up.
     */
    const showQRCode = () => {
        setQrCodeLink(locationShareLink);
        setShareDialogueIsOpen(false);
    };

    { /* Do not show a share button if the Map Template is set up not to support query parameters, since in that case a query parameters will not be respected. */ }
    return supportsUrlParameters && <div className="share-location-link">
        <button className={buttonClassName} onClick={() => setShareDialogueIsOpen(isOpen => !isOpen)}>
            <ShareIcon />
        </button>

        { /* We use the ClickAwayListener to make sure that the dialogue closes when the user clicks outside/away from it. */ }
        {shareDialogueIsOpen && <ClickAwayListener onClickAway={() => setShareDialogueIsOpen(false)}>
            <ul>

                {/* Make a button to copy the link */}
                <li>
                    <button className={buttonClassName} onClick={() => copyLink()}>
                        <ChainLinkIcon />
                        Copy link
                    </button>
                </li>

                {/* Make a button to show a QR code if on larger screens only (it hardly makes sense to show a QR code on a mobile device) */}
                {isDesktop && <li>
                    <button className={buttonClassName} onClick={() => showQRCode()}>
                        <QRCodeIcon />
                        QR Code
                    </button>
                </li>}

            </ul>
        </ClickAwayListener>}
    </div>
}

export default ShareLocationLink;
