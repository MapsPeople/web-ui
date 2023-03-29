import { useEffect } from 'react';
import { useState } from 'react';
import './MapsIndoorsMap.scss';
import MIMap from "../Map/Map";
import SplashScreen from '../SplashScreen/SplashScreen';
import VenueSelector from '../VenueSelector/VenueSelector';
import BottomSheet from '../BottomSheet/BottomSheet';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { MapReadyContext } from '../../MapReadyContext';
import { DirectionsServiceContext } from '../../DirectionsServiceContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import Sidebar from '../Sidebar/Sidebar';

const mapsindoors = window.mapsindoors;

/**
 * Private variable used for checking if the locations should be disabled.
 * Implemented due to the impossibility to use the React useState hook.
 */
let _locationsDisabled;

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
    const [currentCategories, setCurrentCategories] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState();
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();
    const [directionsService, setDirectionsService] = useState();
    const [hasFloorSelector, setHasFloorSelector] = useState(true);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    /**
     * When venue is fitted while initializing the data, set map to be ready.
     */
    function venueChangedOnMap() {
        if (isMapReady === false) {
            setMapReady(true);
        }
        getVenueCategories(currentVenueName);
    }

    /**
     * Show the floor selector.
     */
    function showFloorSelector() {
        if (hasFloorSelector === false) {
            setHasFloorSelector(true);
        }
    }

    /**
     * Hide the floor selector when the directions are open.
     */
    function hideFloorSelector() {
        if (hasFloorSelector === true) {
            setHasFloorSelector(false);
        }
    }

    /**
     * Disable the locations when in directions mode.
     */
    function disableLocations() {
        _locationsDisabled = true;
    }

    /**
     * Enable the locations when not in directions mode.
     */
    function enableLocations() {
        _locationsDisabled = false;
    }

    /**
    * Handle the clicked location on the map.
    * Set the current location if not in directions mode.
    *
    * @param {object} location
    */
    function locationClicked(location) {
        if (_locationsDisabled !== true) {
            setCurrentLocation(location);
        }
    }

    /**
     * Get the categories for the selected venue.
     */
    function getVenueCategories(venue) {
        mapsindoors.services.LocationsService.getLocations({}).then(locations => {
            const filteredLocations = locations.filter(location => location.properties.venueId === venue);
            getCategories(filteredLocations);
        })
    }

    /**
     * Get the unique categories and the count of the categories with locations associated.
     *
     * @param {array} locationsResult
     */
    function getCategories(locationsResult) {
        // Initialise the unique categories map
        let uniqueCategories = new Map();

        // Loop through the locations and count the unique locations.
        // Build an object which contains the key, the count and the display name.
        for (const location of locationsResult) {
            const keys = Object.keys(location.properties.categories);
            for (const key of keys) {
                if (uniqueCategories.has(key)) {
                    let count = uniqueCategories.get(key).count;
                    uniqueCategories.set(key, { count: ++count, displayName: location.properties.categories[key] });
                } else {
                    uniqueCategories.set(key, { count: 1, displayName: location.properties.categories[key] });
                }
            }
        }

        // Sort the categories with most locations associated.
        uniqueCategories = Array.from(uniqueCategories).sort((a, b) => b[1].count - a[1].count);

        setCurrentCategories(uniqueCategories);
    }

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
     * React on changes in the MapsIndoors API key by fetching the required data.
     */
    useEffect(() => {
        setMapReady(false);
        mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);

        Promise.all([
            // Fetch all Venues in the Solution
            mapsindoors.services.VenuesService.getVenues(),
            // Fixme: Venue Images are currently stored in the AppConfig object. So we will need to fetch the AppConfig as well.
            mapsindoors.services.AppConfigService.getConfig(),
            // Ensure a minimum waiting time of 3 seconds
            new Promise(resolve => setTimeout(resolve, 3000))
        ]).then(([venuesResult, appConfigResult]) => {
            venuesResult = venuesResult.map(venue => {
                venue.image = appConfigResult.venueImages[venue.name.toLowerCase()];
                return venue;
            });
            setVenues(venuesResult);
        });
    }, [apiKey]);


    return (<MapsIndoorsContext.Provider value={mapsIndoorsInstance}>
        <MapReadyContext.Provider value={isMapReady}>
            <DirectionsServiceContext.Provider value={directionsService}>
                <div className={`mapsindoors-map ${!hasFloorSelector ? 'mapsindoors-map__floor-selector--hide' : 'mapsindoors-map__floor-selector--show'}`}>
                    {!isMapReady && <SplashScreen logo={logo} primaryColor={primaryColor} />}
                    {venues.length > 1 && <VenueSelector onVenueSelected={selectedVenue => setCurrentVenueName(selectedVenue.name)} venues={venues} currentVenueName={currentVenueName} />}
                    {isMapReady && isDesktop
                        ?
                        <Sidebar
                            currentLocation={currentLocation}
                            setCurrentLocation={setCurrentLocation}
                            currentCategories={currentCategories}
                            onClose={() => setCurrentLocation(null)}
                            onLocationsFiltered={(locations) => setFilteredLocations(locations)}
                            onHideFloorSelector={() => hideFloorSelector()}
                            onShowFloorSelector={() => showFloorSelector()}
                            onDisableLocations={() => disableLocations()}
                            onEnableLocations={() => enableLocations()}
                        />
                        :
                        <BottomSheet
                            currentLocation={currentLocation}
                            setCurrentLocation={setCurrentLocation}
                            currentCategories={currentCategories}
                            onLocationsFiltered={(locations) => setFilteredLocations(locations)}
                            onHideFloorSelector={() => hideFloorSelector()}
                            onShowFloorSelector={() => showFloorSelector()}
                            onDisableLocations={() => disableLocations()}
                            onEnableLocations={() => enableLocations()}
                        />
                    }
                    <MIMap
                        apiKey={apiKey}
                        gmApiKey={gmApiKey}
                        mapboxAccessToken={mapboxAccessToken}
                        venues={venues}
                        venueName={currentVenueName}
                        onVenueChangedOnMap={() => venueChangedOnMap()}
                        onMapsIndoorsInstance={(instance) => setMapsIndoorsInstance(instance)}
                        onDirectionsService={(instance) => setDirectionsService(instance)}
                        onLocationClick={(location) => locationClicked(location)}
                        filteredLocationIds={filteredLocations?.map(location => location.id)} />
                </div>
            </DirectionsServiceContext.Provider>
        </MapReadyContext.Provider>
    </MapsIndoorsContext.Provider>)
}

export default MapsIndoorsMap;
