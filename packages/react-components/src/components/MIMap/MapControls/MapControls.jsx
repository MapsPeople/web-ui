import { useEffect, useRef } from 'react';
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
    const floorSelectorRef = useRef(null);
    const positionButtonRef = useRef(null);

    // Define portal elements as constants
    const venueSelectorPortal = <div key="venue-selector" id="venue-selector-portal" />;
    const floorSelectorPortal = <div key="floor-selector" id="floor-selector-portal" />;
    const myPositionPortal = <div key="my-position-component" id="my-position-element-portal" />;
    const viewModeSwitchPortal = <div key="viewmode-switch" id="view-mode-switch-portal" />;

    // Create and configure web components
    // This useEffect will run when the component mounts and when the mapsIndoorsInstance or mapInstance changes.
    // It will create the web components and set their properties.
    // The web components are created only once and reused when the component re-renders.
    useEffect(() => {
        if (!mapsIndoorsInstance || !mapInstance) return;

        if (!floorSelectorRef.current) {
            const floorSelector = document.createElement('mi-floor-selector');
            floorSelector.id = FLOOR_SELECTOR_ID;
            floorSelectorRef.current = floorSelector;
        }

        if (!positionButtonRef.current) {
            const positionButton = document.createElement('mi-my-position');
            positionButton.id = POSITION_BUTTON_ID;
            positionButtonRef.current = positionButton;
        }

        // Update properties
        floorSelectorRef.current.mapsindoors = mapsIndoorsInstance;
        positionButtonRef.current.mapsindoors = mapsIndoorsInstance;

        if (mapOptions?.brandingColor) {
            floorSelectorRef.current.primaryColor = mapOptions.brandingColor;
        }

        // Setup position control
        if (onPositionControl && positionButtonRef.current) {
            onPositionControl(positionButtonRef.current);
        }

    }, [mapType, mapsIndoorsInstance, mapInstance, onPositionControl, mapOptions]);

    // Handle layout changes and element movement, this handles moving the elements to the correct DOM location based on the layout
    // and ensures that the elements are not duplicated in the DOM.
    // This is important for performance and to avoid issues with the web components.
    // The useEffect will run when the component mounts and when the layout changes (isDesktop changes).
    useEffect(() => {
        if (!floorSelectorRef.current || !positionButtonRef.current) return;

        // Function to move elements to the target container
        // This function will check if the element is already in the target container and move it if not.
        const moveElementToTarget = (element, targetId) => {
            const target = document.getElementById(targetId);
            if (target && !target.contains(element)) {
                element.parentElement?.removeChild(element);
                target.appendChild(element);
            }
        };

        // Move elements to appropriate targets based on current layout
        moveElementToTarget(floorSelectorRef.current, 'floor-selector-portal');
        moveElementToTarget(positionButtonRef.current, 'my-position-element-portal');

    }, [isDesktop]); // Only re-run when layout changes

    if (isDesktop) {
        return (
            <div id="map-controls-container" className="desktop">
                {venueSelectorPortal}
                {viewModeSwitchPortal}
                {myPositionPortal}
                {floorSelectorPortal}
            </div>
        );
    } else {
        return (
            <>
                <div id="map-controls-left-column" className="mobile-column">
                    {venueSelectorPortal}
                    {viewModeSwitchPortal}
                </div>
                <div id="map-controls-right-column" className="mobile-column">
                    {myPositionPortal}
                    {floorSelectorPortal}
                </div>
            </>
        );
    }
}

export default MapControls;