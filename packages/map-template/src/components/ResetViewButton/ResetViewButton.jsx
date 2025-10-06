import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { ReactComponent as GetBackIcon } from '../../assets/get-back-icon.svg';
import './ResetViewButton.scss';

/**
 * ResetViewButton component - A button that resets the map to initial view
 * Positioned above zoom controls using portal system
 */
function ResetViewButton({ onReset, isVisible }) {
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
        console.log('Reset View button clicked!');
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
            className="reset-view-button"
            onClick={handleClick}
            title="Reset to initial view"
            aria-label="Reset to initial view"
        >
            <GetBackIcon />
        </button>,
        portalContainer
    );
}

ResetViewButton.propTypes = {
    onReset: PropTypes.func,
    isVisible: PropTypes.bool
};

export default ResetViewButton;
