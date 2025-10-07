import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './MapControls.scss';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import CustomPositionProvider from '../../../utils/CustomPositionProvider';

MapControls.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapsIndoorsInstance: PropTypes.object.isRequired,
    mapInstance: PropTypes.object.isRequired,
    onPositionControl: PropTypes.func,
    brandingColor: PropTypes.string,
    devicePosition: PropTypes.object
};

/**
 * MapControls component manages the positioning and rendering of map control elements.
 * It handles both desktop and mobile layouts, and manages creation of the web components for floor selection
 * and position control.
 *
 * @param {Object} props - Component properties
 * @param {'google'|'mapbox'} props.mapType - The type of map being used
 * @param {Object} props.mapsIndoorsInstance - MapsIndoors SDK instance
 * @param {Object} props.mapInstance - Map instance (Google Maps or Mapbox)
 * @param {Function} [props.onPositionControl] - Callback function for position control events
 * @param {string} [props.brandingColor] - Custom branding color for controls
 * @param {Object} [props.devicePosition] - Device position data (if available)
 *
 * @returns {JSX.Element} Map controls container with venue selector, floor selector,
 * position button, and view mode switch, arranged differently for desktop and mobile layouts
 */
function MapControls({ mapType, mapsIndoorsInstance, mapInstance, onPositionControl, brandingColor, devicePosition }) {
    const isDesktop = useIsDesktop();
    const floorSelectorRef = useRef(null);
    const positionButtonRef = useRef(null);

    // Define portal elements as constants
    const venueSelectorPortal = <div key="venue-selector" className="venue-selector-portal" />;
    const floorSelectorPortal = <div key="floor-selector" className="floor-selector-portal" />;
    const myPositionPortal = <div key="my-position" className="my-position-element-portal" />;
    const viewModeSwitchPortal = <div key="viewmode-switch" className="viewmode-switch-portal" />;
    const viewSelectorPortal = <div key="view-selector" className="view-selector-portal" />;
    const languageSelectorPortal = <div key="language-selector" className="language-selector-portal" />;

    // Set position and handle floor changes.
    // These are combined because floor should only change if position is successfully set.
    const setPositionAndHandleFloor = (devicePosition) => {
        // Set the position and start watching if successful
        if (positionButtonRef.current.customPositionProvider.setPosition(devicePosition)) {
            positionButtonRef.current.watchPosition();
            
            // If floor information is provided, set the floor on the map
            if (devicePosition.floorIndex && mapsIndoorsInstance) {
                const currentFloor = mapsIndoorsInstance.getFloor();
                const floorNumber = parseInt(devicePosition.floorIndex, 10);
                if (floorNumber !== currentFloor) {
                    mapsIndoorsInstance.setFloor(floorNumber);
                }
            }
        }
    };

    // Create and configure web components
    // This useEffect will run when the component mounts and when the mapsIndoorsInstance or mapInstance changes.
    // It will create the web components and set their properties.
    // The web components are created only once and reused when the component re-renders.
    useEffect(() => {
        if (!mapsIndoorsInstance || !mapInstance) return;

        // Create the web components if they don't exist
        if (!floorSelectorRef.current) {
            const floorSelector = document.createElement('mi-floor-selector');
            floorSelectorRef.current = floorSelector;
        }

        // Create the position button if it doesn't exist
        if (!positionButtonRef.current) {
            const positionButton = document.createElement('mi-my-position');
            positionButtonRef.current = positionButton;
        }

        // Update properties of the floor selector and position button
        floorSelectorRef.current.mapsindoors = mapsIndoorsInstance;
        positionButtonRef.current.mapsindoors = mapsIndoorsInstance;

        if (brandingColor) {
            floorSelectorRef.current.primaryColor = brandingColor;
        }

        // Setup position control
        if (onPositionControl && positionButtonRef.current) {
            onPositionControl(positionButtonRef.current);
        }
    }, [mapType, mapsIndoorsInstance, mapInstance, onPositionControl, brandingColor]);

    // Sync the custom position provider with the latest devicePosition prop.
    // If devicePosition is provided, ensure the custom provider exists and update its position.
    // This enables the position button to reflect the current device position.
    useEffect(() => {
        if (!positionButtonRef.current) return;

        // Stop any existing position listeners before setting up new ones
        if (positionButtonRef.current.stopListeningForPosition && typeof positionButtonRef.current.stopListeningForPosition === 'function') {
            positionButtonRef.current.stopListeningForPosition();
        }

        if (devicePosition && typeof devicePosition === 'object') {
            // Handle empty object case - just initialize the provider
            if (Object.keys(devicePosition).length === 0) {
                if (!positionButtonRef.current.customPositionProvider) {
                    positionButtonRef.current.customPositionProvider = new CustomPositionProvider();
                }
                // Don't call watchPosition() for empty objects - this keeps the icon in POSITION_UNKNOWN state
                return;
            }
            
            // If the custom provider doesn't exist, create and assign it
            if (!positionButtonRef.current.customPositionProvider) {
                positionButtonRef.current.customPositionProvider = new CustomPositionProvider();
            }

            // Set position and handle floor changes (works for both new and existing providers)
            setPositionAndHandleFloor(devicePosition);
        }

        // Cleanup function to stop position listeners when devicePosition changes or component unmounts
        return () => {
            if (positionButtonRef.current &&
                positionButtonRef.current.stopListeningForPosition &&
                typeof positionButtonRef.current.stopListeningForPosition === 'function') {
                positionButtonRef.current.stopListeningForPosition();
            }
        };
    }, [devicePosition]);

    /*
     * Handle layout changes and element movement, this handles moving the elements to the correct DOM location based on the layout
     * and ensures that the elements are not duplicated in the DOM.
     * This is important for performance and to avoid issues with the web components.
     * The useEffect will run when the component mounts and when the layout changes (isDesktop changes).
     */
    useEffect(() => {
        if (!floorSelectorRef.current || !positionButtonRef.current) return;

        // Function to move elements to the target container
        // This function will check if the element is already in the target container and move it if not.
        const moveElementToTarget = (element, targetClass) => {
            const target = document.querySelector(`.${targetClass}`);
            if (target && !target.contains(element)) {
                element.remove();
                target.appendChild(element);
            }
        };

        // Move elements to appropriate targets based on current layout
        moveElementToTarget(floorSelectorRef.current, 'floor-selector-portal');
        moveElementToTarget(positionButtonRef.current, 'my-position-element-portal');

    }, [isDesktop]); // Only re-run when layout changes

    if (isDesktop) {
        {/* For desktop layout, we render all controls in a single container */ }
        return (
            <>
                {/* Top right desktop controls */}
                <div className="map-controls-container desktop top-right">
                    {venueSelectorPortal}
                    {viewSelectorPortal}
                    {languageSelectorPortal}
                    {viewModeSwitchPortal}
                    {myPositionPortal}
                    {floorSelectorPortal}
                </div>

                {/* Bottom right desktop controls */}
                <div className="map-controls-container desktop bottom-right">
                </div>
            </>
        );
    } else {
        {/* For mobile layout, we split controls into two columns */ }
        return (
            <>
                <div className="map-controls-left-column mobile-column">
                    {venueSelectorPortal}
                    {viewModeSwitchPortal}
                    {viewSelectorPortal}
                    {languageSelectorPortal}
                </div>
                <div className="map-controls-right-column mobile-column">
                    {myPositionPortal}
                    {floorSelectorPortal}
                </div>
            </>
        );
    }
}

export default MapControls;
