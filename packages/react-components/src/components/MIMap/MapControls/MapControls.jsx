import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './MapControls.scss';

MapControls.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapsIndoorsInstance: PropTypes.object.isRequired,
    mapInstance: PropTypes.object.isRequired,
    onPositionControl: PropTypes.func,
    mapOptions: PropTypes.object
};

function MapControls({ mapType, mapsIndoorsInstance, mapInstance, onPositionControl, mapOptions }) {
    useEffect(() => {
        if (!mapsIndoorsInstance || !mapInstance) return;

        switch (mapType) {
            case 'mapbox': {
                // Position Control
                const myPositionButtonElement = document.createElement('mi-my-position');
                myPositionButtonElement.mapsindoors = mapsIndoorsInstance;

                // Floor Selector
                const floorSelectorElement = document.createElement('mi-floor-selector');
                floorSelectorElement.mapsindoors = mapsIndoorsInstance;
                if (mapOptions?.brandingColor) {
                    floorSelectorElement.primaryColor = mapOptions.brandingColor;
                }

                // Add elements to portals
                const positionTarget = document.getElementById('my-position-element-portal');
                const floorTarget = document.getElementById('floor-selector-portal');

                if (positionTarget) {
                    positionTarget.appendChild(myPositionButtonElement);
                    if (onPositionControl) {
                        onPositionControl(myPositionButtonElement);
                    }
                }

                if (floorTarget) {
                    floorTarget.appendChild(floorSelectorElement);
                }

                return () => {
                    if (myPositionButtonElement.parentNode) {
                        myPositionButtonElement.parentNode.removeChild(myPositionButtonElement);
                    }
                    if (floorSelectorElement.parentNode) {
                        floorSelectorElement.parentNode.removeChild(floorSelectorElement);
                    }
                };
            }
            default:
                return;
        }
    }, [mapType, mapsIndoorsInstance, mapInstance, onPositionControl, mapOptions]);

    return (
        <div id="map-controls-container">
            <div id="venue-selector-portal" />
            <div id="floor-selector-portal" />
            <div id="my-position-element-portal" />
        </div>
    );
}

export default MapControls;