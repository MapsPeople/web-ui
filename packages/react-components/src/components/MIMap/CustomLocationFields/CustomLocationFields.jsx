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

    // Initialize and set custom position provider on the mi-my-position component
    useEffect(() => {
        if (positionButton) {
            // Only set once
            if (!positionButton.customPositionProvider || !(positionButton.customPositionProvider instanceof CustomPositionProvider)) {
                positionButton.customPositionProvider = new CustomPositionProvider();
            }
        }
    }, [positionButton]);

    const handleSetLocation = () => {
        const myPositionComponent = positionButton;
        if (!myPositionComponent || !myPositionComponent.customPositionProvider) return;

        const lat = parseFloat(latitudeRef.current.value);
        const lng = parseFloat(longitudeRef.current.value);
        if (isNaN(lat) || isNaN(lng)) return;

        const position = {
            coords: { latitude: lat, longitude: lng, accuracy: 10 },
            timestamp: Date.now()
        };

        // Use the modern interface method
        myPositionComponent.customPositionProvider.setPosition(position);
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
            <button onClick={handleSetLocation}>Set Location</button>
        </div>
    );
}

CustomLocationFields.propTypes = {
    positionButton: PropTypes.instanceOf(HTMLElement)
};

export default CustomLocationFields;
