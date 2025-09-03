import { useRef, useEffect } from 'react';
import CustomPositionProvider from '../../../utils/CustomPositionProvider';
import PropTypes from 'prop-types';
import './CustomLocationFields.scss';

/**
 * CustomLocationFields component allows users to input latitude and longitude,
 * and interact with the provided floorSelector (mi-floor-selector web component).
 *
 * @param {Object} props
 * @param {HTMLElement} props.positionButton - Reference to the mi-floor-selector web component
 */
function CustomLocationFields({ positionButton }) {
    const latitudeRef = useRef(null);
    const longitudeRef = useRef(null);

    // Quick test locations
    const testLocations = {
        Aalborg: { lat: 57.0488, lng: 9.9217 },
        Aarhus: { lat: 56.1629, lng: 10.2039 },
        China: { lat: 39.9042, lng: 116.4074 },
        Ohio: { lat: 39.9042, lng: -79.7543387 },
    };

    // Initialize and set custom position provider on the mi-my-position component
    useEffect(() => {
        if (positionButton) {
            // Only set once
            if (!positionButton.customPositionProvider || !(positionButton.customPositionProvider instanceof CustomPositionProvider)) {
                positionButton.customPositionProvider = new CustomPositionProvider();
            }
        }
    }, [positionButton]);

    const handleSetLocation = (lat, lng) => {
        const myPositionComponent = positionButton;
        if (!myPositionComponent || !myPositionComponent.customPositionProvider) return;

        let latitude = lat;
        let longitude = lng;
        // If no lat/lng provided, use input fields
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            latitude = parseFloat(latitudeRef.current.value);
            longitude = parseFloat(longitudeRef.current.value);
        }
        if (isNaN(latitude) || isNaN(longitude)) return;

        const position = {
            coords: { latitude, longitude, accuracy: 10 },
            timestamp: Date.now()
        };

        myPositionComponent.customPositionProvider.setPosition(position);
    };

    const handleQuickLocation = (lat, lng) => {
        handleSetLocation(lat, lng);
    };

    return (
        <div className="custom-location-fields">
            <input
                type="number"
                step="any"
                placeholder="Latitude"
                ref={latitudeRef}
            />
            <input
                type="number"
                step="any"
                placeholder="Longitude"
                ref={longitudeRef}
            />
            <button className="location-btn" onClick={() => handleSetLocation()}>Set Location</button>
            <div className="separator" />
            <h4 className="quick-locations-header">Quick test locations</h4>
            <div className="quick-locations-btns">
                {Object.entries(testLocations).map(([name, coords]) => (
                    <button className="location-btn" key={name} type="button" onClick={() => handleQuickLocation(coords.lat, coords.lng)}>
                        {name}
                    </button>
                ))}
            </div>
        </div>
    );
}

CustomLocationFields.propTypes = {
    positionButton: PropTypes.instanceOf(HTMLElement)
};

export default CustomLocationFields;
