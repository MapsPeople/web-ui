import { useEffect, useRef, useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import './MapControls.scss';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import CustomPositionProvider from '../../../utils/CustomPositionProvider';
import MapZoomControl from '../MapZoomControl/MapZoomControl';
import TextSizeButton from '../TextSizeButton/TextSizeButton';

// Define UI element configuration objects with class names
// This is a single source of truth for the UI elements and their class names
const UI_ELEMENTS = {
    venueSelector: { key: 'venue-selector', className: 'venue-selector-portal' },
    viewSelector: { key: 'view-selector', className: 'view-selector-portal' },
    languageSelector: { key: 'language-selector', className: 'language-selector-portal' },
    viewModeSwitch: { key: 'viewmode-switch', className: 'viewmode-switch-portal' },
    myPosition: { key: 'my-position', className: 'my-position-element-portal' },
    floorSelector: { key: 'floor-selector', className: 'floor-selector-portal' },
    resetView: { key: 'reset-view', className: 'reset-view-portal' },
    zoomControls: { key: 'zoom-controls', className: null }, // React component imported directly, no portal needed
    textSizeButton: { key: 'text-size-button', className: null } // React component imported directly, no portal needed
};

MapControls.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapsIndoorsInstance: PropTypes.object.isRequired,
    mapInstance: PropTypes.object.isRequired,
    onPositionControl: PropTypes.func,
    brandingColor: PropTypes.string,
    devicePosition: PropTypes.object,
    excludedElements: PropTypes.string,
    isKiosk: PropTypes.bool,
    enableAccessibilityKioskControls: PropTypes.bool
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
 * @param {string} [props.excludedElements] - Comma-separated string of element names to exclude from rendering, defaults to empty string -> renders all elements
 * @param {boolean} [props.isKiosk] - Set to true to enable kiosk layout
 * @param {boolean} [props.enableAccessibilityKioskControls] - Set to true to enable accessibility kiosk controls, defaults to false
 *
 * @returns {JSX.Element} Map controls container with venue selector, floor selector,
 * position button, and view mode switch, arranged differently for desktop, kiosk, and mobile layouts
 */
function MapControls({ mapType, mapsIndoorsInstance, mapInstance, onPositionControl, brandingColor, devicePosition, excludedElements = '', isKiosk, enableAccessibilityKioskControls = false }) {
    const isDesktop = useIsDesktop();
    const floorSelectorRef = useRef(null);
    const positionButtonRef = useRef(null);

    // Helper function to check if an element should be rendered
    const shouldRenderElement = useCallback((elementName) => {
        // Check if the element is in the excluded list
        if (!excludedElements || typeof excludedElements !== 'string') {
            return true;
        }
        // Split by comma and check for exact matches
        const excludedList = excludedElements.split(',').map(item => item.trim());
        return !excludedList.includes(elementName);
    }, [excludedElements]);

    // Create UI elements inside component based on the UI_ELEMENTS configuration object.
    const uiElements = useMemo(() => {
        const elements = {};
        for (const [elementName, elementDetails] of Object.entries(UI_ELEMENTS)) {
            elements[elementName] = <div key={elementDetails.key} className={elementDetails.className} />;
        }
        return elements;
    }, []);

    // Set position and handle floor changes.
    // These are combined because floor should only change if position is successfully set.
    const setPositionAndHandleFloor = (devicePosition) => {
        // Set the position and start watching if successful
        if (positionButtonRef.current.customPositionProvider.setPosition(devicePosition)) {
            positionButtonRef.current.watchPosition();
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
            // Initialize the provider if it doesn't exist (for both empty objects and valid positions)
            if (!positionButtonRef.current.customPositionProvider) {
                positionButtonRef.current.customPositionProvider = new CustomPositionProvider();
            }

            // Handle empty object case - just initialize the provider as starting point
            if (Object.keys(devicePosition).length === 0) {
                // Don't call watchPosition() for empty objects - this keeps the icon in POSITION_UNKNOWN state
                return;
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
     * The useEffect will run when the component mounts and when the layout changes (isDesktop or isKiosk changes).
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

        requestAnimationFrame(() => {
            // Only move elements if their portals are visible
            if (shouldRenderElement('floorSelector')) {
                moveElementToTarget(floorSelectorRef.current, UI_ELEMENTS.floorSelector.className);
            }
            if (shouldRenderElement('myPosition')) {
                moveElementToTarget(positionButtonRef.current, UI_ELEMENTS.myPosition.className);
            }
        });

    }, [isDesktop, isKiosk, shouldRenderElement]); // Re-run when layout changes or visibility logic changes

    // Handle visibility of portal elements based on excludedElements
    useEffect(() => {
        Object.entries(UI_ELEMENTS).forEach(([elementName, config]) => {
            // Skip elements without a portal (e.g., React components like zoomControls)
            if (!config.className) return;

            const portal = document.querySelector(`.${config.className}`);
            if (portal) {
                const shouldShow = shouldRenderElement(elementName);
                if (shouldShow) {
                    portal.style.display = '';
                } else {
                    portal.style.display = 'none';
                }
            }
        });
    }, [excludedElements, shouldRenderElement, isDesktop]);

    if (isKiosk) {
        if (enableAccessibilityKioskControls) {
            return (
                <>
                    {/* Top right kiosk controls */}
                    <div className="map-controls-container kiosk top-right">
                    </div>

                    {/* Bottom right kiosk controls */}
                    <div className="map-controls-container kiosk bottom-right">
                        {uiElements.venueSelector}
                        {uiElements.viewSelector}
                        {uiElements.myPosition}
                        {shouldRenderElement('zoomControls') && (
                            <MapZoomControl mapType={mapType} mapInstance={mapInstance} />
                        )}
                        {uiElements.languageSelector}
                        {shouldRenderElement('textSizeButton') && (
                            <TextSizeButton mapsIndoorsInstance={mapsIndoorsInstance} />
                        )}
                        {uiElements.viewModeSwitch}
                        {uiElements.floorSelector}
                        {uiElements.resetView}
                    </div>
                </>
            );
        } else {
            {/* For kiosk layout, render the controls in bottom right */ }
            {/* If enableAccessibilityKioskControls is false, render the default kiosk layout */ }
            return (
                <>
                    {/* Top right kiosk controls */}
                    <div className="map-controls-container kiosk top-right">
                        {uiElements.venueSelector}
                        {uiElements.viewSelector}
                        {uiElements.languageSelector}
                        {uiElements.viewModeSwitch}
                        {uiElements.myPosition}
                        {uiElements.floorSelector}
                    </div>

                    {/* Bottom right kiosk controls */}
                    <div className="map-controls-container kiosk bottom-right">
                        {uiElements.resetView}
                    </div>
                </>
            );
        }
    } else if (isDesktop) {
        {/* For desktop layout, render the controls in the correct container based on the layout */ }
        return (
            <>
                {/* Top right desktop controls */}
                <div className="map-controls-container desktop top-right">
                    {uiElements.venueSelector}
                    {uiElements.viewSelector}
                    {uiElements.languageSelector}
                    {uiElements.viewModeSwitch}
                    {uiElements.myPosition}
                    {uiElements.floorSelector}
                </div>

                {/* Bottom right desktop controls */}
                <div className="map-controls-container desktop bottom-right">
                    {shouldRenderElement('zoomControls') && (
                        <MapZoomControl mapType={mapType} mapInstance={mapInstance} />
                    )}
                    {uiElements.resetView}
                </div>
            </>
        );
    } else {
        {/* For mobile layout, we split controls into two columns */ }
        return (
            <>
                <div className="map-controls-left-column mobile-column">
                    {uiElements.venueSelector}
                    {uiElements.viewModeSwitch}
                    {uiElements.viewSelector}
                    {uiElements.languageSelector}
                </div>
                <div className="map-controls-right-column mobile-column">
                    {uiElements.myPosition}
                    {uiElements.floorSelector}
                </div>
            </>
        );
    }
}

// Memoize the component to prevent unnecessary re-renders when props haven't changed
export default memo(MapControls);
