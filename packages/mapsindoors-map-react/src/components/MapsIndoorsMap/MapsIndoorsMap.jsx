import { useEffect } from 'react';
import { useState } from 'react';
import './MapsIndoorsMap.scss';
import Map from "../Map/Map";
import SplashScreen from '../SplashScreen/SplashScreen';
import VenueSelector from '../VenueSelector/VenueSelector';
import BottomSheet from '../BottomSheet/BottomSheet';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import Modal from '../Modal/Modal';

import { useAppState } from '../../hooks/useAppState';

const mapsindoors = window.mapsindoors;

/**
 *
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Google Maps map.
 * @param {string} [props.venue] - If you want the map to show a specific Venue, provide the Venue name here.
 * @param {string} [props.locationId] - If you want the map to show a specific Location, provide the Location ID here.
 * @param {string} [props.primaryColor] - If you want the splash screen to have a custom primary color, provide the value here.
 * @param {string} [props.logo] - If you want the splash screen to have a custom logo, provide the image path or address here.
 */
function MapsIndoorsMap({ apiKey, gmApiKey, mapboxAccessToken, venue, locationId, primaryColor, logo }) {

    const [isMapReady, setMapReady] = useState(false);
    const [venues, setVenues] = useState([]);
    const [currentVenueName, setCurrentVenueName] = useState();
    const [currentLocation, setCurrentLocation] = useState();
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();
    const isDesktop = useMediaQuery('(min-width: 992px)');
    const [pushToHistory, goBackInHistory, appState, appStates] = useAppState();

    /*
     * React on changes in the venue prop.
     */
    useEffect(() => {
        setCurrentVenueName(venue);
    }, [venue]);

    /**
     * React on changes to the locationId prop: Set as current location and make the map center on it.
     */
    useEffect(() => {
        if (locationId) {
            mapsindoors.services.LocationsService.getLocation(locationId).then(location => {
                if (location) {
                    setCurrentLocation(location);
                }
            });
        }
    }, [locationId]);

    /*
     * React on changes in the MapsIndoors API key.
     * Set the map to be in a ready state when the data has loaded.
     */
    useEffect(() => {
        // Keep track of the time when the process starts and the time when the data has been loaded.
        // Calculate the time taken for the data to load, and determine the time that the splash screen should be shown.
        // The splash screen should be shown for minimum 3 seconds, and if the data takes longer to load, the splash screen should not disappear.
        const startTime = new Date();
        setMapReady(false);
        mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);

        // Fetch venue information when we know data is loaded and set the map to be in a ready state.
        mapsindoors.services.LocationsService.once('update_completed', () => {

            // Fixme: Venue Images are currently stored in the AppConfig object. So we will need to read the AppConfig as well as the list of Venues.
            // This will be changed in the future.
            Promise.all([mapsindoors.services.VenuesService.getVenues(), mapsindoors.services.AppConfigService.getConfig()]).then(([venuesResult, appConfigResult]) => {
                venuesResult = venuesResult.map(venue => {
                    venue.image = appConfigResult.venueImages[venue.name.toLowerCase()];
                    return venue;
                });
                setVenues(venuesResult);

                // Determine the time when the data has finished loading.
                const timeAfterDataIsLoaded = new Date();

                // Divide the number by 1000 in order to get the value in seconds.
                const timeToLoadData = (timeAfterDataIsLoaded - startTime) / 1000;

                // Subtract the time that took to load the data in order to get the differece.
                const timeDifference = (3 - timeToLoadData) * 1000

                // Determine whether to set the map ready or not based on the loading time.
                if (timeToLoadData >= 3) {
                    setMapReady(true);
                } else {
                    setTimeout(() => {
                        setMapReady(true);
                    }, (timeDifference));
                }
            });
        });
    }, [apiKey]);

    return (<MapsIndoorsContext.Provider value={mapsIndoorsInstance}>
        <div className="mapsindoors-map">
            {!isMapReady && <SplashScreen logo={logo} primaryColor={primaryColor} />}
            {venues.length > 1 && <VenueSelector
                onVenueSelected={selectedVenue => setCurrentVenueName(selectedVenue.name)}
                venues={venues}
                currentVenueName={currentVenueName}
                onOpen={() => pushToHistory(appStates.VENUE_SELECTOR)}
                onClose={() => goBackInHistory()}
                active={appState === appStates.VENUE_SELECTOR}
            />}
            {isMapReady && isDesktop
                ?
                <Modal currentLocation={currentLocation} onClose={() => setCurrentLocation(null)} />
                :
                <BottomSheet
                    currentLocation={currentLocation}
                    onClose={() => setCurrentLocation(null)}
                    pushToHistory={pushToHistory}
                    goBackInHistory={goBackInHistory}
                    appState={appState}
                    appStates={appStates}
                />
            }
            <Map apiKey={apiKey} gmApiKey={gmApiKey} mapboxAccessToken={mapboxAccessToken} venues={venues} venueName={currentVenueName} onMapsIndoorsInstance={(instance) => setMapsIndoorsInstance(instance)} onLocationClick={(location) => setCurrentLocation(location)} />
        </div>
    </MapsIndoorsContext.Provider>)
}

export default MapsIndoorsMap;
