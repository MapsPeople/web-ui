import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import PropTypes from 'prop-types';
import shareLinkSelector from '../../../selectors/baseLink';
import { useRecoilValue } from 'recoil';
import './ShareLocationLink.scss';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import qrCodeLinkState from '../../../atoms/qrCodeLinkState';

ShareLocationLink.propTypes = {
    location: PropTypes.object.isRequired
};

/**
 * A button to share a link to the location, either by copying a link it or showing a QR code with the link.
 *
 * @param {object} props
 * @param {object} props.location - The location to share a link to.
 */
function ShareLocationLink({ location }) {

    const [shareDialogueIsOpen, setShareDialogueIsOpen] = useState(false);
    const shareLink = useRecoilValue(shareLinkSelector);
    const [locationShareLink, setLocationShareLink] = useState();

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
    };

    /**
     * Set the QR code link state for the QR code dialog to show up.
     */
    const showQRCode = () => {
        setQrCodeLink(locationShareLink);
    };

    return <div className="share-location-link">
        <button onClick={() => setShareDialogueIsOpen(isOpen => !isOpen)}>Share</button>
        {shareDialogueIsOpen && <ul>

            {/* Make a button to copy the link */}
            <li><button onClick={() => copyLink()}>Copy link</button></li>

            {/* Make a button to show a QR code if on larger screens only (it hardly makes sense to show a QR code on a mobile device) */}
            {isDesktop && <li><button onClick={() => showQRCode()}>QR Code</button></li>}

        </ul>}
    </div>
}

export default ShareLocationLink;
