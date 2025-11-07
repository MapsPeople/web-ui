import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './ScreenshotToolbar.scss';

export const ScreenshotFormat = {
    Web: 'Web',
    Retina: 'High Resolution',
    Print: 'Print'
};

const RESOLUTION_PRESETS = {
    [ScreenshotFormat.Web]: 1,
    [ScreenshotFormat.Retina]: 3,
    [ScreenshotFormat.Print]: 4
};

ScreenshotToolbar.propTypes = {
    mapType: PropTypes.oneOf(['google', 'mapbox']).isRequired,
    mapInstance: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired
};

/**
 * ScreenshotToolbar component - Sidebar for configuring and capturing map screenshots.
 * Shows width/height controls and format selection, with a frame overlay on the map.
 * 
 * @param {Object} props
 * @param {'google'|'mapbox'} props.mapType - The type of map being used
 * @param {Object} props.mapInstance - Map instance (Google Maps or Mapbox)
 * @param {Function} props.onClose - Function to close the toolbar
 */
function ScreenshotToolbar({ mapType, mapInstance, onClose }) {
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);
    const [format] = useState(ScreenshotFormat.Retina); // Always use High Resolution
    const [isCapturing, setIsCapturing] = useState(false);
    const frameOverlayRef = useRef(null);

    // Handle Escape key to close
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopImmediatePropagation();
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Create and update frame overlay
    useEffect(() => {
        if (mapType !== 'mapbox') {
            // Frame overlay only works for Mapbox currently
            return;
        }

        const map = mapInstance.getMap();
        if (!map) return;

        const mapContainer = map.getContainer();
        if (!mapContainer) return;

        // Find parent container with position relative
        let parentContainer = mapContainer.parentElement;
        while (parentContainer && getComputedStyle(parentContainer).position === 'static') {
            parentContainer = parentContainer.parentElement;
        }
        if (!parentContainer) {
            parentContainer = mapContainer.parentElement;
        }

        // Create frame overlay
        const overlay = document.createElement('div');
        overlay.className = 'screenshot-frame-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            pointer-events: none;
        `;

        const frameInner = document.createElement('div');
        frameInner.className = 'screenshot-frame-inner';
        frameInner.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 0 3000px rgba(0,0,0,0.25);
            border: 2px solid #fff;
            pointer-events: none;
            transition: all 0.3s ease;
        `;

        // Create indicators
        const widthIndicator = document.createElement('div');
        widthIndicator.className = 'screenshot-indicator screenshot-indicator-width';
        widthIndicator.style.cssText = `
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            color: #fff;
            background: rgba(0,0,0,0.7);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
        `;

        const heightIndicator = document.createElement('div');
        heightIndicator.className = 'screenshot-indicator screenshot-indicator-height';
        heightIndicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: -120px;
            transform: translateY(-50%) rotate(-90deg);
            color: #fff;
            background: rgba(0,0,0,0.7);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
        `;

        frameInner.appendChild(widthIndicator);
        frameInner.appendChild(heightIndicator);
        overlay.appendChild(frameInner);
        parentContainer.insertBefore(overlay, mapContainer.nextSibling);
        frameOverlayRef.current = overlay;

        // Update frame size
        updateFrameSize(overlay, width, height, format);

        return () => {
            if (overlay.parentElement) {
                overlay.parentElement.removeChild(overlay);
            }
        };
    }, [mapType, mapInstance]);

    // Update frame size when dimensions or format change
    useEffect(() => {
        if (frameOverlayRef.current) {
            updateFrameSize(frameOverlayRef.current, width, height, format);
        }
    }, [width, height, format]);

    const updateFrameSize = (overlay, w, h, fmt) => {
        const frameInner = overlay.querySelector('.screenshot-frame-inner');
        const widthIndicator = overlay.querySelector('.screenshot-indicator-width');
        const heightIndicator = overlay.querySelector('.screenshot-indicator-height');

        if (frameInner) {
            // Ensure w and h are valid numbers (use defaults if empty or invalid)
            const numWidth = (w === '' || w === null || w === undefined) ? 800 : (typeof w === 'number' ? w : (parseInt(w) || 800));
            const numHeight = (h === '' || h === null || h === undefined) ? 600 : (typeof h === 'number' ? h : (parseInt(h) || 600));
            const scale = RESOLUTION_PRESETS[fmt];
            const displayWidth = numWidth * scale;
            const displayHeight = numHeight * scale;

            frameInner.style.width = `${numWidth}px`;
            frameInner.style.height = `${numHeight}px`;

            if (widthIndicator) {
                widthIndicator.textContent = `${displayWidth}px (${numWidth} × ${scale})`;
            }

            if (heightIndicator) {
                heightIndicator.textContent = `${displayHeight}px (${numHeight} × ${scale})`;
            }
        }
    };

    const getScale = () => {
        return RESOLUTION_PRESETS[format];
    };

    const handleWidthChange = (e) => {
        const value = e.target.value;
        // Allow free typing including empty string - store the value as-is
        // Only validate that it's numeric format, don't clamp during typing
        if (value === '') {
            setWidth('');
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
                setWidth(numValue);
            }
        }
    };

    const handleWidthBlur = (e) => {
        // Clamp on blur to ensure valid value
        const value = e.target.value;
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 10) {
            setWidth(10);
        } else if (numValue > 2000) {
            setWidth(2000);
        } else {
            setWidth(numValue);
        }
    };

    const handleHeightChange = (e) => {
        const value = e.target.value;
        // Allow free typing including empty string - store the value as-is
        // Only validate that it's numeric format, don't clamp during typing
        if (value === '') {
            setHeight('');
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
                setHeight(numValue);
            }
        }
    };

    const handleHeightBlur = (e) => {
        // Clamp on blur to ensure valid value
        const value = e.target.value;
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 10) {
            setHeight(10);
        } else if (numValue > 2000) {
            setHeight(2000);
        } else {
            setHeight(numValue);
        }
    };

    /**
     * Helper function to capture screenshot using render event
     * @param {Object} map - Mapbox map instance
     * @returns {Promise<string>} Promise that resolves to data URL
     */
    const takeScreenshot = (map) => {
        return new Promise((resolve, reject) => {
            try {
                map.once('render', () => {
                    const canvas = map.getCanvas();
                    if (canvas) {
                        resolve(canvas.toDataURL('image/png'));
                    } else {
                        reject(new Error('Could not get map canvas'));
                    }
                });
                // Trigger render by setting bearing to current bearing (no-op that triggers render)
                map.setBearing(map.getBearing());
            } catch (error) {
                reject(error);
            }
        });
    };

    const handleCapture = async () => {
        if (isCapturing || mapType !== 'mapbox') return;

        setIsCapturing(true);
        try {
            const map = mapInstance.getMap();
            const scale = getScale();
            // Ensure width and height are valid numbers before capturing
            const finalWidth = typeof width === 'number' ? width : parseInt(width) || 800;
            const finalHeight = typeof height === 'number' ? height : parseInt(height) || 600;
            const targetWidth = finalWidth * scale;
            const targetHeight = finalHeight * scale;

            // For high-resolution, we need to temporarily resize the map
            if (scale > 1) {
                const mapContainer = map.getContainer();
                const originalWidth = mapContainer.clientWidth;
                const originalHeight = mapContainer.clientHeight;
                const originalCenter = map.getCenter();
                const originalZoom = map.getZoom();
                const originalBearing = map.getBearing();
                const originalPitch = map.getPitch();

                // Temporarily resize
                mapContainer.style.width = `${targetWidth}px`;
                mapContainer.style.height = `${targetHeight}px`;
                map.resize();

                // Adjust zoom to show same area at higher resolution
                const zoomAdjustment = Math.log2(scale);
                const newZoom = originalZoom + zoomAdjustment;

                // Set the new view state
                map.setCenter(originalCenter);
                map.setZoom(newZoom);
                map.setBearing(originalBearing);
                map.setPitch(originalPitch);

                // Wait for render event and capture
                try {
                    const dataUrl = await takeScreenshot(map);
                    downloadScreenshot(dataUrl);

                    // Restore original dimensions
                    mapContainer.style.width = `${originalWidth}px`;
                    mapContainer.style.height = `${originalHeight}px`;
                    map.resize();
                    map.setCenter(originalCenter);
                    map.setZoom(originalZoom);
                    map.setBearing(originalBearing);
                    map.setPitch(originalPitch);

                    setIsCapturing(false);
                } catch (captureError) {
                    // Restore on error
                    mapContainer.style.width = `${originalWidth}px`;
                    mapContainer.style.height = `${originalHeight}px`;
                    map.resize();
                    map.setCenter(originalCenter);
                    map.setZoom(originalZoom);
                    map.setBearing(originalBearing);
                    map.setPitch(originalPitch);
                    throw captureError;
                }
            } else {
                // For 1x scale, capture directly using render event
                const dataUrl = await takeScreenshot(map);
                downloadScreenshot(dataUrl);
                setIsCapturing(false);
            }
        } catch (error) {
            console.error('Error capturing screenshot:', error);
            alert(`Failed to capture screenshot: ${error.message}`);
            setIsCapturing(false);
        }
    };

    const downloadScreenshot = (dataUrl) => {
        const link = document.createElement('a');
        link.download = `screenshot-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFormatDisplayText = (fmt) => {
        const scale = RESOLUTION_PRESETS[fmt];
        return `${fmt} (${scale}x)`;
    };

    return (
        <div className="screenshot-toolbar">
            <div className="screenshot-toolbar__header">
                <h3>Screenshot</h3>
                <button className="screenshot-toolbar__close" onClick={onClose} aria-label="Close">
                    ×
                </button>
            </div>

            <div className="screenshot-toolbar__content">
                <div className="screenshot-toolbar__field">
                    <label htmlFor="screenshot-width">Width (px)</label>
                    <input
                        id="screenshot-width"
                        type="number"
                        min="10"
                        max="2000"
                        value={width === '' ? '' : width}
                        onChange={handleWidthChange}
                        onBlur={handleWidthBlur}
                    />
                </div>

                <div className="screenshot-toolbar__field">
                    <label htmlFor="screenshot-height">Height (px)</label>
                    <input
                        id="screenshot-height"
                        type="number"
                        min="10"
                        max="2000"
                        value={height === '' ? '' : height}
                        onChange={handleHeightChange}
                        onBlur={handleHeightBlur}
                    />
                </div>

                <div className="screenshot-toolbar__field">
                    <label>Format</label>
                    <div className="screenshot-toolbar__format-info">
                        <span>{getFormatDisplayText(ScreenshotFormat.Retina)}</span>
                    </div>
                </div>

                <div className="screenshot-toolbar__info">
                    <p>Final: {((width === '' || width === null || width === undefined) ? 800 : (typeof width === 'number' ? width : parseInt(width) || 800) * getScale())} × {((height === '' || height === null || height === undefined) ? 600 : (typeof height === 'number' ? height : parseInt(height) || 600) * getScale())} px</p>
                </div>
            </div>

            <div className="screenshot-toolbar__footer">
                <button
                    className="screenshot-toolbar__button screenshot-toolbar__button--cancel"
                    onClick={onClose}
                    disabled={isCapturing}
                >
                    Cancel
                </button>
                <button
                    className="screenshot-toolbar__button screenshot-toolbar__button--capture"
                    onClick={handleCapture}
                    disabled={isCapturing}
                >
                    {isCapturing ? 'Capturing...' : 'Capture'}
                </button>
            </div>
        </div>
    );
}

export default ScreenshotToolbar;