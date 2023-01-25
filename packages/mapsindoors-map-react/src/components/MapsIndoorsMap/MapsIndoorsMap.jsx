import { useEffect } from 'react';
import { useState } from 'react';
import './MapsIndoorsMap.scss';
import Map from "../Map/Map";
import SplashScreen from '../SplashScreen/SplashScreen';
import VenueSelector from '../VenueSelector/VenueSelector';
import BottomSheet from '../BottomSheet/BottomSheet';
import { useRef } from 'react';

const mapsindoors = window.mapsindoors;

/**
 *
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Google Maps map.
 * @param {string} [props.venue] - If you want the map to show a specific Venue, provide the Venue name here.
 */
function MapsIndoorsMap({ apiKey, gmApiKey, mapboxAccessToken, venue }) {

    const [isMapReady, setMapReady] = useState(false);
    const [venues, setVenues] = useState([]);
    const [currentVenueName, setCurrentVenueName] = useState();
    const [currentLocation, setCurrentLocation] = useState();

    const mapsIndoorsMapRef = useRef(null);

    /*
     * React on changes in the venue prop.
     */
    useEffect(() => {
        setCurrentVenueName(venue);
    }, [venue]);

    /*
     * React on changes in the MapsIndoors API key.
     * Set the map to be in a ready state when the data has loaded.
     */
    useEffect(() => {
        setMapReady(false);
        mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);

        // Fetch venue information when we know data is loaded and set the map to be in a ready state.
        mapsindoors.services.LocationsService.once('update_completed', () => {

            // Fixme: Venue Images are currently stored in the AppConfig object. So we will need to read the AppConfig as well as the list of Venues.
            // This will be changed in the future.
            Promise.all([mapsindoors.services.VenuesService.getVenues(),mapsindoors.services.AppConfigService.getConfig()]).then(([venuesResult, appConfigResult]) => {
                venuesResult = venuesResult.map(venue => {
                    venue.image = appConfigResult.venueImages[venue.name.toLowerCase()];
                    return venue;
                });

                setVenues(venuesResult);
                setMapReady(true);
            });
        });
    }, [apiKey]);

    return (<div ref={mapsIndoorsMapRef} className="mapsindoors-map">
        {!isMapReady && <SplashScreen />}
        {venues.length > 1 && <VenueSelector onVenueSelected={selectedVenue => setCurrentVenueName(selectedVenue.name)} venues={venues} currentVenueName={currentVenueName} />}
        {isMapReady && <BottomSheet mountPoint={mapsIndoorsMapRef} currentLocation={currentLocation} onClose={() => setCurrentLocation(null)} />}
        <Map apiKey={apiKey} gmApiKey={gmApiKey} mapboxAccessToken={mapboxAccessToken} venues={venues} venueName={currentVenueName} onLocationClick={(location) => setCurrentLocation(location)} />
    </div>)
}

export default MapsIndoorsMap;
