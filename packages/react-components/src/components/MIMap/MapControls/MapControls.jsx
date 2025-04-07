import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './MapControls.scss';
import { useIsDesktop } from '../../../hooks/useIsDesktop';

// Unique IDs for the elements to maintain persistence
const FLOOR_SELECTOR_ID = 'mi-floor-selector-element';
const POSITION_BUTTON_ID = 'mi-position-button-element';

MapControls.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapsIndoorsInstance: PropTypes.object.isRequired,
    mapInstance: PropTypes.object.isRequired,
    onPositionControl: PropTypes.func,
    mapOptions: PropTypes.object
};

function MapControls({ mapType, mapsIndoorsInstance, mapInstance, onPositionControl, mapOptions }) {
    const isDesktop = useIsDesktop();

    console.log(isDesktop);

    useEffect(() => {
        if (!mapsIndoorsInstance || !mapInstance) return;

        // Get portal targets
        const positionTarget = document.getElementById('my-position-element-portal');
        const floorTarget = document.getElementById('floor-selector-portal');

        // Look for existing elements first
        let floorSelectorElement = document.getElementById(FLOOR_SELECTOR_ID);
        let myPositionButtonElement = document.getElementById(POSITION_BUTTON_ID);
        // Handle different map types
        switch (mapType) {
            case 'mapbox': {
                // Create the position button element if it doesn't exist
                // This element allows users to center the map on their current position
                if (!myPositionButtonElement) {
                    myPositionButtonElement = document.createElement('mi-my-position');
                    myPositionButtonElement.id = POSITION_BUTTON_ID;
                }

                // Create the floor selector element if it doesn't exist
                // This element allows users to switch between different floor levels
                if (!floorSelectorElement) {
                    floorSelectorElement = document.createElement('mi-floor-selector');
                    floorSelectorElement.id = FLOOR_SELECTOR_ID;
                }

                // Update the MapsIndoors instance reference for the position button
                // This ensures the button has access to the latest map state
                myPositionButtonElement.mapsindoors = mapsIndoorsInstance;

                // Update the MapsIndoors instance and styling for the floor selector
                floorSelectorElement.mapsindoors = mapsIndoorsInstance;
                // Apply custom branding color if provided in map options
                if (mapOptions?.brandingColor) {
                    floorSelectorElement.primaryColor = mapOptions.brandingColor;
                }

                // Add the position button to the DOM if not already present
                // Also trigger the position control callback if provided
                if (positionTarget && !positionTarget.contains(myPositionButtonElement)) {
                    positionTarget.appendChild(myPositionButtonElement);
                    if (onPositionControl) {
                        onPositionControl(myPositionButtonElement);
                    }
                }

                // Add the floor selector to the DOM if not already present
                if (floorTarget && !floorTarget.contains(floorSelectorElement)) {
                    floorTarget.appendChild(floorSelectorElement);
                }

                break;
            }
            default:
                break;
        }
    }, [mapType, mapsIndoorsInstance, mapInstance, onPositionControl, mapOptions]);

    return (
        <div id="map-controls-container">
            <div id="venue-selector-portal" />
            <div id="floor-selector-portal" />
            <div id="my-position-element-portal" />
            <div id="view-mode-switch-portal" />
        </div>
    );

    // if (isDesktop) {
    //     // Desktop layout - single column in top right
    //     return (
    //         <div id="map-controls-container" className="desktop">
    //             <div id="venue-selector-portal" />
    //             <div id="floor-selector-portal" />
    //             <div id="my-position-element-portal" />
    //             <div id="view-mode-switch-portal" />
    //         </div>
    //     )
    // } else {
    //     // Mobile layout - two separate columns
    //     return (
    //         <>
    //             <div id="map-controls-left-column" className="mobile-column">
    //                 <div id="venue-selector-portal" />
    //                 <div id="view-mode-switch-portal" />

    //             </div>
    //             <div id="map-controls-right-column" className="mobile-column">
    //                 <div id="floor-selector-portal" />
    //                 <div id="my-position-element-portal" />
    //             </div>
    //         </>
    //     )
    // }
}

export default MapControls;