import { useState } from 'react';
import PropTypes from 'prop-types';
import './ScreenshotDialog.scss';

const RESOLUTION_PRESETS = {
    web: 1,
    retina: 2,
    print: 3
};

ScreenshotDialog.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapInstance: PropTypes.object.isRequired,
    mapsIndoorsInstance: PropTypes.object,
    onClose: PropTypes.func.isRequired
};

/**
 * ScreenshotDialog component - Dialog for configuring and capturing map screenshots.
 * 
 * @param {Object} props
 * @param {'google'|'mapbox'} props.mapType - The type of map being used
 * @param {Object} props.mapInstance - Map instance (Google Maps or Mapbox)
 * @param {Object} [props.mapsIndoorsInstance] - MapsIndoors SDK instance
 * @param {Function} props.onClose - Function to close the dialog
 */
function ScreenshotDialog({ mapType, mapInstance, onClose }) {
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [resolution, setResolution] = useState('web');
    const [isCapturing, setIsCapturing] = useState(false);

    const handleCapture = async () => {
        setIsCapturing(true);
        try {
            const scale = RESOLUTION_PRESETS[resolution];
            const finalWidth = width * scale;
            const finalHeight = height * scale;

            let dataUrl;
            
            if (mapType === 'mapbox') {
                // Mapbox: Use getCanvas() to capture the map
                const map = mapInstance.getMap();
                const canvas = map.getCanvas();
                
                // The canvas dimensions represent the actual rendered size
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;

                // Create a new canvas with the desired dimensions
                const screenshotCanvas = document.createElement('canvas');
                screenshotCanvas.width = finalWidth;
                screenshotCanvas.height = finalHeight;
                const ctx = screenshotCanvas.getContext('2d');

                // Use high-quality image scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw the map canvas to the screenshot canvas, scaling it
                ctx.drawImage(canvas, 0, 0, canvasWidth, canvasHeight, 0, 0, finalWidth, finalHeight);

                dataUrl = screenshotCanvas.toDataURL('image/png', 1.0);
            } else {
                // Google Maps: Try to capture the map canvas
                const mapElement = document.getElementById('map');
                if (!mapElement) {
                    throw new Error('Map element not found');
                }

                // Find the canvas element in the map container
                const mapCanvas = mapElement.querySelector('canvas');
                if (!mapCanvas) {
                    throw new Error('Map canvas not found');
                }

                // Create a new canvas with the desired dimensions
                const screenshotCanvas = document.createElement('canvas');
                screenshotCanvas.width = finalWidth;
                screenshotCanvas.height = finalHeight;
                const ctx = screenshotCanvas.getContext('2d');

                // Use high-quality image scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw the map canvas to the screenshot canvas, scaling it
                ctx.drawImage(mapCanvas, 0, 0, mapCanvas.width, mapCanvas.height, 0, 0, finalWidth, finalHeight);

                dataUrl = screenshotCanvas.toDataURL('image/png', 1.0);
            }

            // Download the screenshot
            const link = document.createElement('a');
            link.download = `map-screenshot-${width}x${height}-${resolution}-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            onClose();
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            alert(`Failed to capture screenshot: ${error.message}. Please try again.`);
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <>
            <div className="screenshot-dialog-background" onClick={onClose}></div>
            <div className="screenshot-dialog">
                <div className="screenshot-dialog__header">
                    <h2>Take Screenshot</h2>
                    <button className="screenshot-dialog__close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                
                <div className="screenshot-dialog__content">
                    <div className="screenshot-dialog__field">
                        <label htmlFor="width">Width (px)</label>
                        <input
                            id="width"
                            type="number"
                            min="100"
                            max="8000"
                            value={width}
                            onChange={(e) => setWidth(parseInt(e.target.value) || 1920)}
                        />
                    </div>

                    <div className="screenshot-dialog__field">
                        <label htmlFor="height">Height (px)</label>
                        <input
                            id="height"
                            type="number"
                            min="100"
                            max="8000"
                            value={height}
                            onChange={(e) => setHeight(parseInt(e.target.value) || 1080)}
                        />
                    </div>

                    <div className="screenshot-dialog__field">
                        <label htmlFor="resolution">Resolution</label>
                        <select
                            id="resolution"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                        >
                            <option value="web">Web (1x)</option>
                            <option value="retina">Retina (2x)</option>
                            <option value="print">Print (3x)</option>
                        </select>
                    </div>

                    <div className="screenshot-dialog__info">
                        <p>Final dimensions: {width * RESOLUTION_PRESETS[resolution]} × {height * RESOLUTION_PRESETS[resolution]} px</p>
                    </div>
                </div>

                <div className="screenshot-dialog__footer">
                    <button 
                        className="screenshot-dialog__button screenshot-dialog__button--cancel"
                        onClick={onClose}
                        disabled={isCapturing}
                    >
                        Cancel
                    </button>
                    <button 
                        className="screenshot-dialog__button screenshot-dialog__button--capture"
                        onClick={handleCapture}
                        disabled={isCapturing}
                    >
                        {isCapturing ? 'Capturing...' : 'Capture'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default ScreenshotDialog;
