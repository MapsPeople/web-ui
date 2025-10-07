import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { ReactComponent as ResetKioskViewIcon } from '../../assets/reset-kiosk-view.svg';
import './ResetKioskViewButton.scss';

/**
 * ResetKioskViewButton component - A button that resets the map to initial view
 * Positioned above zoom controls using portal system
 */
function ResetKioskViewButton({ onReset, isVisible }) {
    const [portalContainer, setPortalContainer] = useState(null);
    const resetButtonMountPoint = '.reset-view-portal';

    // Find portal target
    useEffect(() => {
        let portalTargetMountPoint = document.querySelector(resetButtonMountPoint);
        if (portalTargetMountPoint) {
            setPortalContainer(portalTargetMountPoint);
            return;
        }
        
        const observer = new MutationObserver(() => {
            portalTargetMountPoint = document.querySelector(resetButtonMountPoint);
            if (portalTargetMountPoint) {
                setPortalContainer(portalTargetMountPoint);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, []);

    const handleClick = () => {
        if (onReset) {
            onReset();
        }
    };

    // Early return if not visible
    if (!isVisible) {
        return null;
    }

    if (!portalContainer) return null;

    return createPortal(
        <button 
            className="reset-kiosk-view-button"
            onClick={handleClick}
            title="Reset to initial kiosk view"
            aria-label="Reset to initial kiosk view"
        >
            <ResetKioskViewIcon />
        </button>,
        portalContainer
    );
}

ResetKioskViewButton.propTypes = {
    onReset: PropTypes.func,
    isVisible: PropTypes.bool
};

export default ResetKioskViewButton;