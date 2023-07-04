import { useEffect } from 'react';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import './MapTemplate.scss';
import MIMap from "../Map/Map";
import SplashScreen from '../SplashScreen/SplashScreen';
import VenueSelector from '../VenueSelector/VenueSelector';
import BottomSheet from '../BottomSheet/BottomSheet';
import apiKeyState from '../../atoms/apiKeyState';
import gmApiKeyState from '../../atoms/gmApiKeyState';
import isMapReadyState from '../../atoms/isMapReadyState.js';
import currentLocationState from '../../atoms/currentLocationState';
import tileStyleState from '../../atoms/tileStyleState';
import categoriesState from '../../atoms/categoriesState';
import venuesState from '../../atoms/venuesState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import { useAppHistory } from '../../hooks/useAppHistory';
import useMediaQuery from '../../hooks/useMediaQuery';
import Sidebar from '../Sidebar/Sidebar';
import useLocationForWayfinding from '../../hooks/useLocationForWayfinding';
import locationIdState from '../../atoms/locationIdState';
import mapboxAccessTokenState from '../../atoms/mapboxAccessTokenState';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import startZoomLevelState from '../../atoms/startZoomLevelState';
import primaryColorState from '../../atoms/primaryColorState';

defineCustomElements();

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
 * @param {string} [props.directionsFrom] - If you want to show directions instantly, provide a MapsIndoors Location ID or the string "USER_POSITION" here to be used as the origin.
 * @param {string} [props.directionsTo] - If you want to show directions instantly, provide a MapsIndoors Location ID or the string "USER_POSITION" here to be used as the destination.
 * @param {array} [props.externalIDs] - Filter locations shown on the map based on the external IDs.
 * @param {string} [props.tileStyle] - Tile style name to change the interface of the map.
 * @param {number} [props.startZoomLevel] - The initial zoom level of the map.
 */
function MapTemplate({ apiKey, gmApiKey, mapboxAccessToken, venue, locationId, primaryColor, logo, appUserRoles, directionsFrom, directionsTo, externalIDs, tileStyle, startZoomLevel }) {

    const [, setApiKey] = useRecoilState(apiKeyState);
    const [, setGmApyKey] = useRecoilState(gmApiKeyState);
    const [, setMapboxAccessToken] = useRecoilState(mapboxAccessTokenState);
    const [isMapReady, setMapReady] = useRecoilState(isMapReadyState);
    const [venues, setVenues] = useRecoilState(venuesState);
    const [, setCurrentVenueName] = useRecoilState(currentVenueNameState);
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const [, setCategories] = useRecoilState(categoriesState);
    const [, setLocationId] = useRecoilState(locationIdState);
    const [hasDirectionsOpen, setHasDirectionsOpen] = useState(false);
    const [appConfigResult, setAppConfigResult] = useState();
    const [, setPrimaryColor] = useRecoilState(primaryColorState);

    const directionsFromLocation = useLocationForWayfinding(directionsFrom);
    const directionsToLocation = useLocationForWayfinding(directionsTo);

    // The filtered locations by external id, if present.
    const [, setFilteredLocationsByExternalID] = useRecoilState(filteredLocationsByExternalIDState);

    // The filtered locations that the user sets when selecting a category/location.
    const [filteredLocations, setFilteredLocations] = useRecoilState(filteredLocationsState);

    // Holds a copy of the initially filtered locations.
    const [initialFilteredLocations, setInitialFilteredLocations] = useState();

    const [, setTileStyle] = useRecoilState(tileStyleState);
    const [, setStartZoomLevel] = useRecoilState(startZoomLevelState);

    const isDesktop = useMediaQuery('(min-width: 992px)');
    const isMobile = useMediaQuery('(max-width: 991px)');

    const [pushAppView, goBack, currentAppView, currentAppViewPayload, appStates] = useAppHistory();

    /**
     * Ensure that MapsIndoors Web SDK is available.
     *
     * @returns {Promise}
     */
    function initializeMapsIndoorsSDK() {
        return new Promise((resolve) => {
            if (window.mapsindoors !== undefined) {
                return resolve();
            }

            const miSdkApiTag = document.createElement('script');
            miSdkApiTag.setAttribute('type', 'text/javascript');
            miSdkApiTag.setAttribute('src', 'https://app.mapsindoors.com/mapsindoors/js/sdk/4.23.1/mapsindoors-4.23.1.js.gz');
            document.body.appendChild(miSdkApiTag);
            miSdkApiTag.onload = () => resolve();
        });
    }

    /**
     * Wait for the MapsIndoors JS SDK to be initialized, then react on changes on the props.
     * React on changes in the MapsIndoors API key by fetching the required data.
     */
    useEffect(() => {
        initializeMapsIndoorsSDK().then(() => {
            const mapsindoors = window.mapsindoors;

            setApiKey(apiKey);
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
            setMapReady(false);

            // React on changes in the app user roles prop.
            mapsindoors.services.SolutionsService.getUserRoles().then(userRoles => {
                const roles = userRoles.filter(role => appUserRoles?.includes(role.name));
                mapsindoors.MapsIndoors.setUserRoles(roles);
            });

            // React on changes in the externalIDs prop.
            // Get the locations by external IDs, if present.
            if (externalIDs) {
                mapsindoors.services.LocationsService.getLocationsByExternalId(externalIDs).then(locations => {
                    setFilteredLocationsByExternalID(locations);
                });
            } else {
                setFilteredLocationsByExternalID([]);
            }

            // React on changes to the locationId prop.
            // Set as current location and change the venue according to the venue that the location belongs to.
            setLocationId(locationId);
            if (locationId) {
                mapsindoors.services.LocationsService.getLocation(locationId).then(location => {
                    if (location) {
                        setCurrentVenueName(location.properties.venueId);
                        setCurrentLocation(location);
                    }
                });
            }

            // React to changes in the gmApiKey and mapboxAccessToken props.
            setMapboxAccessToken(mapboxAccessToken);
            setGmApyKey(gmApiKey);
        });
    }, [apiKey, appUserRoles, externalIDs, locationId, mapboxAccessToken, gmApiKey]);


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

    /*
     * React on changes in the venue prop.
     */
    useEffect(() => {
        setCurrentVenueName(venue);
    }, [venue]);

    /*
     * React on changes in the tile style prop.
     */
    useEffect(() => {
        setTileStyle(tileStyle)
    }, [tileStyle]);

    /*
     * React on changes in the primary color prop.
     */
    useEffect(() => {
        setPrimaryColor(primaryColor)
    }, [primaryColor]);

    /*
     * React on changes in the start zoom level prop.
     */
    useEffect(() => {
        setStartZoomLevel(startZoomLevel);
    }, [startZoomLevel]);

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

    /**
     * When venue is fitted while initializing the data,
     * set map to be ready and get the venue categories.
     */
    function venueChangedOnMap(venue) {
        if (isMapReady === false) {
            setMapReady(true);
        }
        getVenueCategories(venue.name);
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
        window.mapsindoors.services.LocationsService.getLocations({}).then(locations => {
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

        setCategories(uniqueCategories);
    }

    return <div className={`mapsindoors-map ${hasDirectionsOpen ? 'mapsindoors-map--hide-elements' : 'mapsindoors-map--show-elements'}`}>
        {!isMapReady && <SplashScreen logo={logo} />}
        {venues.length > 1 && <VenueSelector
            onOpen={() => pushAppView(appStates.VENUE_SELECTOR)}
            onClose={() => goBack()}
            active={currentAppView === appStates.VENUE_SELECTOR}
        />}
        {isMapReady &&
            <>
                {isDesktop &&
                    <Sidebar
                        directionsFromLocation={directionsFromLocation}
                        directionsToLocation={directionsToLocation}
                        pushAppView={pushAppView}
                        currentAppView={currentAppView}
                        appViews={appStates}
                    />
                }
                {isMobile &&
                    <BottomSheet
                        directionsFromLocation={directionsFromLocation}
                        directionsToLocation={directionsToLocation}
                        pushAppView={pushAppView}
                        currentAppView={currentAppView}
                        appViews={appStates}
                    />
                }
            </>
        }
        <MIMap
            onVenueChangedOnMap={(venue) => venueChangedOnMap(venue)}
            onLocationClick={(location) => locationClicked(location)}
        />
    </div>
}

export default MapTemplate;
