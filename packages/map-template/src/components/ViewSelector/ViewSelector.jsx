/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { ReactComponent as ChevronDownIcon } from '../../assets/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from '../../assets/chevron-up.svg';
import { ReactComponent as PanViewIcon } from '../../assets/pan-view-icon.svg';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import './ViewSelector.scss';
import { useRecoilValue } from 'recoil';

function ViewSelector() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const isDesktop = useIsDesktop();
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const currentVenueName = useRecoilValue(currentVenueNameState);

    // Get all buildings for the current venue
    useEffect(() => {
        if (mapsIndoorsInstance && currentVenueName) {
            // Get the current venue
            window.mapsindoors.services.VenuesService.getVenue(currentVenueName)
                .then(venue => {
                    // Get all buildings for the current venue
                    return window.mapsindoors.services.VenuesService.getBuildings();
                })
                .then(buildingsData => {
                    setBuildings(buildingsData);
                })
                .catch(error => {
                    console.error('Error fetching buildings:', error);
                });
        }
    }, [mapsIndoorsInstance, currentVenueName]);

    // Early return if the current venue has one building
    if (buildings.length == 1) {
        return null;
    }

    /**
     * Toggle button component that renders different content based on the isDesktop prop
     * @param {boolean} props.isDesktop Whether the component is being rendered on desktop
     * @param {string} props.buttonText Text to display on the button (desktop only)
     */
    // eslint-disable-next-line react/prop-types
    const ToggleButton = ({ isDesktop, buttonText }) => {

        /* Render mobile list toggle button if isDesktop is false */
        if (!isDesktop) {
            return (
                <button className="view-selector-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
                    <PanViewIcon />
                </button>
            );
        }

        /* Render desktop list toggle button if isDesktop is true */
        return (
            <button className="view-selector-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
                <PanViewIcon />
                <span> {buttonText}</span>
                {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>
        );
    };

    return (
        <div className="view-selector-container">
            {/* Mobile view selector container */}
            {!isDesktop && isExpanded && (
                <div className="mobile-view-selector-container">
                    <div className="mobile-header">
                        <button className="mobile-exit-button" onClick={() => setIsExpanded(false)}>X</button>
                        <span>Pan Map to View</span>
                    </div>
                    {/* Mobile view building selector list */}
                    <div className="mobile-view-selector-list">
                        <button className="mobile-view-selector-option">
                            <p>Is Test</p>
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop view selector container */}
            {isDesktop && isExpanded && (
                <div className="desktop-view-selector-container">
                    {/* Desktop view building selector list */}
                    <div className="desktop-view-selector-list">
                        <button className="desktop-view-selector-option">
                            <p>Is Test</p>
                        </button>
                    </div>
                </div>
            )}
            {/* Button to toggle the view selector 
            
            Long button on desktop (Icont + Text -> Placement bottom right)
            Icon only on mobile (placement top left , between venue selector and view selector)
            Needs exit button on mobile
            */}
            <ToggleButton isDesktop={isDesktop} buttonText="Pan map to view" />
        </div>
    );
}

export default ViewSelector;