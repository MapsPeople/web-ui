import { useState } from 'react';
import './App.scss'
import MIMap from '@mapsindoors/react-components/src/components/MIMap/MIMap';
import Header from './Header/Header';
import addBlueDot from './tools/addBlueDot';
import Search from './Search/Search';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';

defineCustomElements();

function App() {

    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState(null);

    // MapsIndoors Austin Office location
    const center = { lng: -97.74203004999998, lat: 30.360050363249286 };
    // A well fitting zoom level
    const zoom = 17.6;

    /**
     * Callback for when the MapsIndoors instance is initialized.
     */
    const onInitialized = (initializedMapsIndoorsInstance, positionControl) => {
        setMapsIndoorsInstance(initializedMapsIndoorsInstance);

        const mapboxMap = initializedMapsIndoorsInstance.getMap();
        mapboxMap.on('style.load', () => {
            // Add fake blue dot signalling the current device position.
            // This is NOT using the built in MapsIndoors positioning feature, but is just a faked visual representation.
            addBlueDot(mapboxMap);

            // Remove the built-in Position Control from the map. We will fake the position instead.
            positionControl.remove();
        });
    };

    return (
        <div className="app mapsindoors-map"> {/* The mapsindoors-map class is added for giving the MapsIndoors components library access to the MapsIndoors CSS variables */}
            <Header />
            <main>
                <MIMap
                    apiKey="mapspeople3d"
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                    center={center}
                    zoom={zoom}
                    onInitialized={onInitialized}
                />
                <Search mapsIndoorsInstance={mapsIndoorsInstance} />
            </main>
        </div>
    )
}

export default App
