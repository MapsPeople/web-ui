import { useState } from 'react';
import './App.css'
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import MIMap from '@mapsindoors/react-components/src/components/MIMap/MIMap';
import fakeData from './fakeData';
import addBlueDot from './tools/addBlueDot';
import Header from './Header/Header';
import Search from './Search/Search';
import LocationDetails from './LocationDetails/LocationDetails';

defineCustomElements();

function App() {

    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState(null);

    const [selectedLocation, setSelectedLocation] = useState(null);

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

        initializedMapsIndoorsInstance.on('click', (location) => {
            setSelectedLocation(location);
        });
    };

    /**
     * When a search result is clicked, we want to show the details for the MapsIndoors Location.
     * In this specific case (as opposed to clicking on a MapsIndoors Location on the map), we also want to zoom to the Location.
     *
     * @param {object} location
     */
    const onSearchResultClicked = (location) => {
        setSelectedLocation(location);
        gotoLocation(location);
    };

    /**
     * Make the map center over a MapsIndoors Location on the map.
     *
     * @param {object} location
     */
    const gotoLocation = (location) => {
        // Make sure to set the floor level of the map to the floor level of the Location.
        mapsIndoorsInstance.setFloor(location.properties.floor);

        // TODO: Calculate any padding needed to make sure the Location is not hidden behind the UI.

        // Make the map pan to the Location, but don't zoom to far in.
        mapsIndoorsInstance.goTo(location, { maxZoom: 21 });
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
                    <Search onSearchResultClicked={location => onSearchResultClicked(location)} selectedLocation={selectedLocation} mapsIndoorsInstance={mapsIndoorsInstance} />
                    <LocationDetails onRequestClose={() => setSelectedLocation(null)} location={selectedLocation} />
                </div>
            </main>
        </div>
    )
}

export default App
