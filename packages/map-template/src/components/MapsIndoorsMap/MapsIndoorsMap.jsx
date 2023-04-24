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
import { useAppHistory } from '../../hooks/useAppHistory';
import { UserPositionContext } from '../../UserPositionContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import Sidebar from '../Sidebar/Sidebar';
import useLocationForWayfinding from '../../hooks/useLocationForWayfinding';

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
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map.
 * @param {string} [props.venue] - If you want the map to show a specific Venue, provide the Venue name here.
 * @param {string} [props.locationId] - If you want the map to show a specific Location, provide the Location ID here.
 * @param {string} [props.primaryColor] - If you want the splash screen to have a custom primary color, provide the value here.
 * @param {string} [props.logo] - If you want the splash screen to have a custom logo, provide the image path or address here.
 * @param {array} [props.appUserRoles] - If you want the map to behave differently for specific users, set one or more app user roles here.
 * @param {string} [props.directionsFrom] - If you want to show directions instantly, provide a MapsIndoors Location ID here to be used as the origin. Must be used together with directionsTo.
 * @param {string} [props.directionsTo] - If you want to show directions instantly, provide a MapsIndoors Location ID here to be used as the destination. Must be used together with directionsFrom.
 */
function MapsIndoorsMap({ apiKey, gmApiKey, mapboxAccessToken, venue, locationId, primaryColor, logo, appUserRoles, directionsFrom, directionsTo }) {

    const [isMapReady, setMapReady] = useState(false);
    const [venues, setVenues] = useState([]);
    const [currentVenueName, setCurrentVenueName] = useState();
    const [currentLocation, setCurrentLocation] = useState();
    const [currentCategories, setCurrentCategories] = useState([]);
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();
    const [directionsService, setDirectionsService] = useState();
    const [hasDirectionsOpen, setHasDirectionsOpen] = useState(false);
    const [positionControl, setPositionControl] = useState();
    const [userPosition, setUserPosition] = useState();
 	const [appConfigResult, setAppConfigResult] = useState();

    const directionsFromLocation = useLocationForWayfinding(directionsFrom, userPosition, positionControl);
    const directionsToLocation = useLocationForWayfinding(directionsTo, userPosition, positionControl);

    // The filtered locations that the user sets when selecting a category/location.
    const [filteredLocations, setFilteredLocations] = useState();

    // Holds a copy of the initially filtered locations.
    const [initialFilteredLocations, setInitialFilteredLocations] = useState();

    const isDesktop = useMediaQuery('(min-width: 992px)');
    const [pushAppView, goBack, currentAppView, currentAppViewPayload, appStates] = useAppHistory();

    /*
     * Add Location to history payload to make it possible to re-enter location details with that Location.
     */
    useEffect(() => {
        if (currentAppView === appStates.LOCATION_DETAILS && currentAppViewPayload && !currentLocation) {
            setCurrentLocation(currentAppViewPayload);
        }

        setHasDirectionsOpen(currentAppView === appStates.DIRECTIONS);
        _locationsDisabled = currentAppView === appStates.DIRECTIONS;
    }, [currentAppView]);

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
     *
     * @param {string} venue
     */
    function getVenueCategories(venue) {
        // Filter through the locations which have the venueId equal to the selected venue,
        // due to the impossibility to use the venue parameter in the getLocations().
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
        // Build an object which contains the key, the count, the display name and an icon.
        for (const location of locationsResult) {
            const keys = Object.keys(location.properties.categories);

            for (const key of keys) {
                // Get the categories from the App Config that have a matching key.
                const appConfigCategory = appConfigResult?.menuInfo.mainmenu.find(category => category.categoryKey === key);

                if (uniqueCategories.has(key)) {
                    let count = uniqueCategories.get(key).count;
                    uniqueCategories.set(key, { count: ++count, displayName: location.properties.categories[key], iconUrl: appConfigCategory?.iconUrl });
                } else {
                    uniqueCategories.set(key, { count: 1, displayName: location.properties.categories[key], iconUrl: appConfigCategory?.iconUrl });
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

    /*
     * React on changes in the app user roles prop.
     */
    useEffect(() => {
        mapsindoors.services.SolutionsService.getUserRoles().then(userRoles => {
            const roles = userRoles.filter(role => appUserRoles?.includes(role.name));
            mapsindoors.MapsIndoors.setUserRoles(roles);
        });
    }, [appUserRoles]);


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
            setAppConfigResult(appConfigResult);
            setVenues(venuesResult);
        });
    }, [apiKey]);


    /*
     * React on changes in directions opened state.
     */
    useEffect(() => {
        // Reset all the filters when in directions mode.
        // Store the filtered locations in another state, to be able to access them again.
        if (hasDirectionsOpen) {
            setInitialFilteredLocations(filteredLocations)
            setFilteredLocations([]);
        } else {
            // Apply the previously filtered locations to the map when navigating outside the directions.
            setFilteredLocations(initialFilteredLocations);
        }
    }, [hasDirectionsOpen]);

    return (<MapsIndoorsContext.Provider value={mapsIndoorsInstance}>
        <MapReadyContext.Provider value={isMapReady}>
            <DirectionsServiceContext.Provider value={directionsService}>
                <UserPositionContext.Provider value={userPosition}>
                    <div className={`mapsindoors-map ${hasDirectionsOpen ? 'mapsindoors-map--hide-elements' : 'mapsindoors-map--show-elements'}`}>
                        {!isMapReady && <SplashScreen logo={logo} primaryColor={primaryColor} />}
                        {venues.length > 1 && <VenueSelector
                            onVenueSelected={selectedVenue => setCurrentVenueName(selectedVenue.name)}
                            venues={venues}
                            currentVenueName={currentVenueName}
                            onOpen={() => pushAppView(appStates.VENUE_SELECTOR)}
                            onClose={() => goBack()}
                            active={currentAppView === appStates.VENUE_SELECTOR}
                        />}
                        {isMapReady && isDesktop
                            ?
                            <Sidebar
                                currentLocation={currentLocation}
                                currentVenueName={currentVenueName}
                                setCurrentLocation={setCurrentLocation}
                                currentCategories={currentCategories}
                                onClose={() => setCurrentLocation(null)}
                                onLocationsFiltered={(locations) => setFilteredLocations(locations)}
                                directionsFromLocation={directionsFromLocation}
                                directionsToLocation={directionsToLocation}
                                pushAppView={pushAppView}
                                currentAppView={currentAppView}
                                appViews={appStates}
                            />
                            :
                            <BottomSheet
                                currentLocation={currentLocation}
                                currentVenueName={currentVenueName}
                                setCurrentLocation={setCurrentLocation}
                                currentCategories={currentCategories}
                                onLocationsFiltered={(locations) => setFilteredLocations(locations)}
                                directionsFromLocation={directionsFromLocation}
                                directionsToLocation={directionsToLocation}
                                pushAppView={pushAppView}
                                currentAppView={currentAppView}
                                appViews={appStates}
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
                            onPositionControl={positionControl => setPositionControl(positionControl)}
                            onUserPosition={position => setUserPosition(position)}
                            filteredLocationIds={filteredLocations?.map(location => location.id)} />
                    </div>
                </UserPositionContext.Provider>
            </DirectionsServiceContext.Provider>
        </MapReadyContext.Provider>
    </MapsIndoorsContext.Provider>)
}

export default MapsIndoorsMap;
