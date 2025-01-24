import fakeData from '../fakeData';

/**
 * Add a blue dot to the Mapbox map based on a fake position.
 */
export default function(mapboxMap) {
    // Generate a pulsing dot for the fake device position
    const pulsingDot = generatePulsingDot(mapboxMap);
    mapboxMap.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    // Add the fake device position as a source on the Mapbox map
    mapboxMap.addSource('fake-device-position', {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [fakeData.devicePosition.lng, fakeData.devicePosition.lat]
            }
        }
    });

    // Add a layer to the map that shows a blue dot at the fake device position
    mapboxMap.addLayer({
        id: 'fake-device-position',
        type: 'symbol',
        source: 'fake-device-position',
        layout: {
            'icon-image': 'pulsing-dot',
            'icon-allow-overlap': true
        }
    });
}

/**
 * Generate a pulsing dot for the map using a canvas.
 */
function generatePulsingDot(mapboxMap) {
    const canvasSize = 100;

    return {
        width: canvasSize,
        height: canvasSize,
        data: new Uint8Array(canvasSize * canvasSize * 4),

        onAdd: function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },

        render: function () {
            const duration = 1000; // ms

            // Normalized time within the current cycle, between 0 and 1.
            const t = (performance.now() % duration) / duration;

            const radius = (canvasSize / 2) * 0.3;
            const outerRadius = (canvasSize / 2) * 0.7 * t + radius;
            const context = this.context;

            // Draw the outer circle.
            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                outerRadius / 2,
                0,
                Math.PI * 2
            );
            context.fillStyle = `rgba(48, 113, 217, ${1 - t})`;
            context.fill();

            // Draw the inner circle.
            context.beginPath();
            context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
            context.fillStyle = 'rgba(48, 113, 217, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            // Update this image's data with data from the canvas.
            this.data = context.getImageData(0, 0, this.width, this.height).data;

            // Continuously repaint the map, resulting
            // in the smooth animation of the dot.
            mapboxMap.triggerRepaint();

            // Return `true` to let the map know that the image was updated.
            return true;
        }
    };
}
