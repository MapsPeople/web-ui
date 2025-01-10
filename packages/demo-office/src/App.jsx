import { useState } from 'react';
import './App.css'
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import MIMap from '@mapsindoors/react-components/src/components/MIMap/MIMap';
import fakeData from './fakeData';
import addBlueDot from './tools/addBlueDot';
import Header from './Header/Header';
import Search from './Search/Search';

defineCustomElements();

function App() {

    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState(null);

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
            <main className="app__main">
                <MIMap
                    // Map provider setup. See the README for more information on how to set up a Mapbox account and get an access token.
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}

                    // MapsIndoors setup: Provide a MapsIndoors API key or solution alias in order to let the map know which MapsIndoors solution to use.
                    apiKey={fakeData.solutionAlias}

                    // Map position in the world
                    center={fakeData.startPosition.center}
                    zoom={fakeData.startPosition.zoom}

                    // Callback for when the MapsIndoors instance is initialized
                    onInitialized={onInitialized}
                />
                <div className="app__cards">
                    <Search mapsIndoorsInstance={mapsIndoorsInstance} />
                </div>
            </main>
        </div>
    )
}

export default App
