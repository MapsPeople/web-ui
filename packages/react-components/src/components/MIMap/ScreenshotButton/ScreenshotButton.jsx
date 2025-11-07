import { useState } from 'react';
import PropTypes from 'prop-types';
import './ScreenshotButton.scss';
import ScreenshotToolbar from '../ScreenshotToolbar/ScreenshotToolbar';

ScreenshotButton.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapInstance: PropTypes.object.isRequired,
    mapsIndoorsInstance: PropTypes.object
};

/**
 * ScreenshotButton component - A button that toggles the screenshot toolbar for capturing the map.
 * Positioned above the zoom controls.
 * 
 * @param {Object} props
 * @param {'google'|'mapbox'} props.mapType - The type of map being used
 * @param {Object} props.mapInstance - Map instance (Google Maps or Mapbox)
 * @param {Object} [props.mapsIndoorsInstance] - MapsIndoors SDK instance
 */
function ScreenshotButton({ mapType, mapInstance }) {
    const [isToolbarOpen, setIsToolbarOpen] = useState(false);

    return (
        <>
            <button 
                className={`screenshot-button ${isToolbarOpen ? 'active' : ''}`}
                onClick={() => setIsToolbarOpen(!isToolbarOpen)}
                aria-label="Take screenshot"
                title="Take screenshot"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
            </button>
            {isToolbarOpen && (
                <ScreenshotToolbar
                    mapType={mapType}
                    mapInstance={mapInstance}
                    onClose={() => setIsToolbarOpen(false)}
                />
            )}
        </>
    );
}

export default ScreenshotButton;
