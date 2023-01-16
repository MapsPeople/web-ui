import { useEffect } from 'react';
import { useState } from 'react';
import Map from '../Map/Map';
import VenueSelector from '../VenueSelector/VenueSelector';
import './MapsIndoorsMap.scss';

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
        mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);

        // Fetch venue information when we know data is loaded and set the map to be in a ready state.
        mapsindoors.services.LocationsService.once('update_completed', () => {
            mapsindoors.services.VenuesService.getVenues().then(result => {
                setVenues(result);
                setMapReady(true);
            });
        });
    }, [apiKey]);

    return (<div className="full mapsindoors-map">
        {/* Splash screen, bottoms sheets, venue selector etc. can be here */}
        {venues.length > 1 && <VenueSelector onVenueSelected={selectedVenue => setCurrentVenueName(selectedVenue.name)} venues={venues} currentVenueName={currentVenueName} />}
        <Map apiKey={apiKey} gmApiKey={gmApiKey} mapboxAccessToken={mapboxAccessToken} venues={venues} venueName={currentVenueName} />
    </div>)
}

export default MapsIndoorsMap;
