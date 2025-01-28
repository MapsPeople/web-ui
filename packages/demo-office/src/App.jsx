import { useEffect, useState } from 'react';
import './App.css'
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import MIMap from '@mapsindoors/react-components/src/components/MIMap/MIMap';
import fakeData from './fakeData';
import addBlueDot from './tools/addBlueDot';
import Header from './Header/Header';
import Search from './Search/Search';
import LocationDetails from './LocationDetails/LocationDetails';
import useMediaQuery from './hooks/useMediaQuery';

// We use this to define how a location is selected, because that has an impact on how we want to handle the zooming to the location.
const selectedLocationInitiatorType = Object.freeze({
    MAP_CLICK: 'MAP_CLICK',
    SEARCH_RESULT_CLICK: 'SEARCH_RESULT_CLICK'
});


defineCustomElements();

function App() {
    const isDesktop = useMediaQuery('(min-width: 992px)');

    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState(null);

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedLocationInitiator, setSelectedLocationInitiator] = useState(null);
    const [locationDetailsHeight, setLocationDetailsHeight] = useState(0);

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
            setSelectedLocationInitiator(selectedLocationInitiatorType.MAP_CLICK);
            setSelectedLocation(location);
        });
    };

    /**
     * When a search result is clicked, we want to show the details for the MapsIndoors Location.
     * In this specific case (as opposed to clicking on a MapsIndoors Location on the map), we also want to zoom to the Location.
     * That's why we also set the selectedLocationInitiator to SEARCH_RESULT_CLICK. That will be picked by a useEffect hook that will zoom to the Location.
     *
     * @param {object} location
     */
    const onSearchResultClicked = (location) => {
        setSelectedLocationInitiator(selectedLocationInitiatorType.SEARCH_RESULT_CLICK);
        setSelectedLocation(location);
    };

    /*
     * When the selected Location changes, we want to make sure it is visually selected on the map.
     */
    useEffect(() => {
        if (!mapsIndoorsInstance) return;

        if (selectedLocation) {
            // Make the Location visually appear as selected on the map.
            mapsIndoorsInstance.selectLocation(selectedLocation);
        } else {
            // Deselect the Location on the map.
            mapsIndoorsInstance.deselectLocation();
        }
    }, [selectedLocation]); // eslint-disable-line react-hooks/exhaustive-deps

    /*
     * When the selected Location changes, we want to make sure the map is centered over the Location.
     */
    useEffect(() => {
        if (selectedLocation && selectedLocationInitiator === selectedLocationInitiatorType.SEARCH_RESULT_CLICK && locationDetailsHeight) {
            goToLocation(selectedLocation);
        }
    }, [selectedLocation, selectedLocationInitiator, locationDetailsHeight]);

    /**
     * Make the map center over a MapsIndoors Location on the map.
     *
     * @param {object} location
     */
    const goToLocation = (location) => {
        // Make sure to set the floor level of the map to the floor level of the Location.
        mapsIndoorsInstance.setFloor(location.properties.floor);

        // Make the map pan to the Location, but don't zoom too far in.
        // We add some padding to make sure the Location is not hidden behind the UI.
        // We do this on mobile sized viewports only since only where the details modal can be seen to cover part of the map
        // as opposed to larger screens where the details modal is shown on the map but large parts of the map is still visible.
        mapsIndoorsInstance.goTo(location, {
            maxZoom: 21,
            padding: {
                top: 0,
                bottom: !isDesktop ? locationDetailsHeight : 0,
                left: 0,
                right: 0
            }
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
                    <Search onSearchResultClicked={location => onSearchResultClicked(location)} selectedLocation={selectedLocation} mapsIndoorsInstance={mapsIndoorsInstance} />
                    <LocationDetails onHeightChanged={height => setLocationDetailsHeight(height)} onRequestClose={() => setSelectedLocation(null)} location={selectedLocation} />
                </div>
            </main>
        </div>
    )
}

export default App
