import { useEffect, useState } from "react";
import GoogleMapsMap from "./GoogleMapsMap/GoogleMapsMap";
import MapboxMap from "./MapboxMap/MapboxMap";

const mapsindoors = window.mapsindoors;

const MAP_TYPES = {
    GOOGLE: 'google',
    MAPBOX: 'mapbox'
};

const localStorageKeyForVenue = 'MI-MAP-TEMPLATE-LAST-VENUE';

/**
 * Shows a map.
 *
 * @param {Object} props
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map.
 * @param {array} [props.venues] - Array of Venues in the current solution.
 * @param {string} [props.venueName] - If you want the map to show a specific Venue, provide the Venue name here.
 * @param {function} [props.onLocationClick] - Function that is run when a MapsIndoors Location is clicked. the Location will be sent along as first argument.
 * @param {function} props.onMapsIndoorsInstance - Function that is run when a MapsIndoors instance is created. The instance will be sent along as first argument.
 * @param {function} props.onDirectionsService - Function that is run when a DirectionsService instance is created. The instance will be sent along as first argument.
 * @param {function} props.onVenueChangedOnMap - Function that is run when the map bounds was changed due to fitting to a venue.
 * @param {array} props.filteredLocationIds - Array of IDs of the filtered locations.
 * @returns
 */
function Map({ gmApiKey, mapboxAccessToken, venues, venueName, onLocationClick, onMapsIndoorsInstance, onDirectionsService, onVenueChangedOnMap, filteredLocationIds }) {
    const [mapType, setMapType] = useState();
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState(null);

    useEffect(() => {
        if (mapboxAccessToken) {
            setMapType(MAP_TYPES.MAPBOX);
        } else {
            // A Google Maps map will have precedense if no keys or keys for both providers are set.
            setMapType(MAP_TYPES.GOOGLE);
        }
    }, [gmApiKey, mapboxAccessToken]);

    /*
     * React to changes in the venue prop.
     */
    useEffect(() => {
        if (mapsIndoorsInstance) {
            window.localStorage.clear(localStorageKeyForVenue);
            const venueToShow = getVenueToShow(venueName, venues);
            if (venueToShow) {
                setVenue(venueToShow, mapsIndoorsInstance).then(() => {
                    onVenueChangedOnMap();
                });
            };
        }
    }, [venueName, venues]); // eslint-disable-line react-hooks/exhaustive-deps
    // We ignore eslint warnings about missing dependencies because mapsIndoorsInstance should never change runtime anyway.

    /*
     * Show the filtered locations on the map based on their IDs.
     */
    useEffect(() => {
        if (filteredLocationIds && mapsIndoorsInstance) {
            mapsIndoorsInstance.filter(filteredLocationIds);
        }
    }, [filteredLocationIds, mapsIndoorsInstance]);

    /**
     * Set the venue to show on the map.
     *
     * @param {object} venue
     * @param {object} mapsIndoorsInstance
     */
    const setVenue = (venue, mapsIndoorsInstance) => {
        window.localStorage.setItem(localStorageKeyForVenue, venue.name);
        return mapsIndoorsInstance.fitVenue(venue);
    }

    const onMapView = async (mapView, externalDirectionsProvider) => {
        // Instantiate MapsIndoors instance
        const miInstance = new mapsindoors.MapsIndoors({
            mapView
        });

        miInstance.setDisplayRule('MI_BUILDING_OUTLINE', {visible: false});

        miInstance.on('click', location => onLocationClick(location));

        setMapsIndoorsInstance(miInstance);
        onMapsIndoorsInstance(miInstance);

        // Initialize a Directions Service
        const directionsService = new mapsindoors.services.DirectionsService(externalDirectionsProvider);
        onDirectionsService(directionsService);

        const venueToShow = getVenueToShow(venueName, venues);
        if (venueToShow) {
            setVenue(venueToShow, miInstance);
        }
    };

    return (<>
        {mapType === MAP_TYPES.GOOGLE && <GoogleMapsMap gmApiKey={gmApiKey} onMapView={onMapView} mapsIndoorsInstance={mapsIndoorsInstance} />}
        {mapType === MAP_TYPES.MAPBOX && <MapboxMap mapboxAccessToken={mapboxAccessToken} onMapView={onMapView} mapsIndoorsInstance={mapsIndoorsInstance} />}
    </>)
}

export default Map;


/**
 * Get the venue to show initally on the map.
 *
 * @param {string} preferredVenueName
 * @param {array} venues
 * @returns {object} - venue
 */
function getVenueToShow(preferredVenueName, venues) {
    if (venues.length === 0) return;

    // If there's only one venue, early return with that.
    if (venues.length === 1) {
        return venues[0];
    }

    // If last selected venue is set in localStorage, use that.
    const lastSetVenue = window.localStorage.getItem(localStorageKeyForVenue);
    if (lastSetVenue) {
        const venue = venues.find(v => v.name === lastSetVenue);
        if (venue) {
            return venue;
        }
    }

    // If venue parameter is set on the component, use that.
    if (preferredVenueName) {
        const venue = venues.find(v => v.name === preferredVenueName);
        if (venue) {
            return venue;
        }
    }

    // Else take first venue sorted alphabetically
    return venues.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); })[0];
}