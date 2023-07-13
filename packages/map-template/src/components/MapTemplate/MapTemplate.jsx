import { useEffect, useRef } from 'react';
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
import logoState from '../../atoms/logoState';
import defaultLogo from "../../assets/logo.svg";

defineCustomElements();

// The current query string
const queryString = window.location.search;
const params = new URLSearchParams(queryString);

const apiKeyParameter = params.get('apiKey');
const venueParameter = params.get('venue');
const locationIdParameter = params.get('locationId');
const logoParameter = params.get('logo');
const directionsFromParameter = params.get('directionsFrom');
const directionsToParameter = params.get('directionsTo');
const tileStyleParameter = params.get('tileStyle');
const startZoomLevelParameter = params.get('startZoomLevel');
const gmApiKeyParameter = params.get('gmApiKey');
const mapboxAccessTokenParameter = params.get('mapboxAccessToken');

// Append the hashtag symbol to the color code (i.e. ffffff)
const primaryColorParameter = params.get('primaryColor');

// The HEX value refers to the --brand-colors-dark-pine-100 from MIDT
const hexPrimaryColorParameter = primaryColorParameter ? '#'.concat(primaryColorParameter) : '#005655';

// Create an array of app user roles based on the comma separated values
const appUserRolesParameter = params.get('appUserRoles')?.split(',')

// Create an array of external IDs based on the comma separated values
const externalIDsParameter = params.get('externalIDs')?.split(',')

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
 * @param {boolean} [props.hasURLParameters] - If you want to support URL Parameters.
 */
function MapTemplate({ apiKey, gmApiKey, mapboxAccessToken, venue, locationId, primaryColor, logo, appUserRoles, directionsFrom, directionsTo, externalIDs, tileStyle, startZoomLevel, hasURLParameters }) {

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
    const [, setPrimaryColor] = useRecoilState(primaryColorState);
    const [, setLogo] = useRecoilState(logoState);

    const directionsFromLocation = useLocationForWayfinding(directionsFrom);
    const directionsToLocation = useLocationForWayfinding(directionsTo);
    const directionsFromLocationParameter = useLocationForWayfinding(directionsFromParameter);
    const directionsToLocationParameter = useLocationForWayfinding(directionsToParameter);

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

    // Declare the reference to the App Config
    const appConfigRef = useRef();

    // Indicate if the MapsIndoors JavaScript SDK is available
    const [mapsindoorsSDKAvailable, setMapsindoorsSDKAvailable] = useState(false);

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
            miSdkApiTag.setAttribute('src', 'https://app.mapsindoors.com/mapsindoors/js/sdk/4.24.0/mapsindoors-4.24.0.js.gz');
            document.body.appendChild(miSdkApiTag);
            miSdkApiTag.onload = () => {
                resolve();
            }
        });
    }

    /**
     * Wait for the MapsIndoors JS SDK to be initialized, then set the mapsindoorsSDKAvailable state to true.
     */
    useEffect(() => {
        initializeMapsIndoorsSDK().then(() => {
            setMapsindoorsSDKAvailable(true);
        });
    }, [])

    /**
     * React on changes in the MapsIndoors API key by fetching the required data.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {

            // Check if the Map Template has URL Parameters and handle each case
            if (hasURLParameters) {
                // 1. First case is if the Map Template has an apiKey and URL parameters
                if (apiKey) {
                    setApiKey(apiKeyParameter ? apiKeyParameter : apiKey)
                    window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKeyParameter ? apiKeyParameter : apiKey);
                }
                // 2. Second case is if the Map Template does not have an apikey but has URL parameters
                else {
                    setApiKey(apiKeyParameter ? apiKeyParameter : '3ddemo')
                    window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKeyParameter ? apiKeyParameter : '3ddemo');
                }
            }
            // 3. Third case is if the Map Template does not have URL parameters but may/may not have an api key
            else {
                setApiKey(apiKey ? apiKey : '3ddemo');
                window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey ? apiKey : '3ddemo');
            }

            setMapReady(false);

            Promise.all([
                // Fetch all Venues in the Solution
                window.mapsindoors.services.VenuesService.getVenues(),
                // Fixme: Venue Images are currently stored in the AppConfig object. So we will need to fetch the AppConfig as well.
                window.mapsindoors.services.AppConfigService.getConfig(),
                // Ensure a minimum waiting time of 3 seconds
                new Promise(resolve => setTimeout(resolve, 3000))
            ]).then(([venuesResult, appConfigResult]) => {
                venuesResult = venuesResult.map(venue => {
                    venue.image = appConfigResult.venueImages[venue.name.toLowerCase()];
                    return venue;
                });
                appConfigRef.current = appConfigResult;
                setVenues(venuesResult);
            });
            setMapReady(false);
        }
    }, [apiKey, mapsindoorsSDKAvailable, hasURLParameters]);

    /*
     * React to changes in the gmApiKey and mapboxAccessToken props.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            if (hasURLParameters) {
                if (mapboxAccessToken) {
                    setMapboxAccessToken(mapboxAccessTokenParameter ? mapboxAccessTokenParameter : mapboxAccessToken);
                } else {
                    setMapboxAccessToken(mapboxAccessTokenParameter ? mapboxAccessTokenParameter : import.meta.env.VITE_MAPBOX_ACCESS_TOKEN)
                }
                if (gmApiKey) {
                    setGmApyKey(gmApiKeyParameter ? gmApiKeyParameter : gmApiKey);
                } else {
                    setGmApyKey(gmApiKeyParameter ? gmApiKeyParameter : import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
                }
            } else {
                setMapboxAccessToken(mapboxAccessToken ? mapboxAccessToken : import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
                setGmApyKey(gmApiKey ? gmApiKey : import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
            }
        }
    }, [gmApiKey, mapboxAccessToken, mapsindoorsSDKAvailable, hasURLParameters]);

    /*
     * React on changes in the app user roles prop.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            window.mapsindoors.services.SolutionsService.getUserRoles().then(userRoles => {
                const roles = userRoles.filter(role => appUserRoles?.includes(role.name));

                if (hasURLParameters) {
                    if (appUserRoles) {
                        window.mapsindoors.MapsIndoors.setUserRoles(appUserRolesParameter ? appUserRolesParameter : roles);
                    } else {
                        window.mapsindoors.MapsIndoors.setUserRoles(appUserRolesParameter ? appUserRolesParameter : []);
                    }
                } else {
                    window.mapsindoors.MapsIndoors.setUserRoles(appUserRoles ? roles : []);
                }
            });
        }
    }, [appUserRoles, mapsindoorsSDKAvailable, hasURLParameters]);

    /*
     * React on changes in the externalIDs prop.
     * Get the locations by external IDs, if present.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {

            if (hasURLParameters) {
                if (externalIDs) {
                    window.mapsindoors.services.LocationsService.getLocationsByExternalId(externalIDsParameter ? externalIDsParameter : externalIDs).then(locations => {
                        setFilteredLocationsByExternalID(locations);
                    });
                } else {
                    window.mapsindoors.services.LocationsService.getLocationsByExternalId(externalIDsParameter ? externalIDsParameter : []).then(locations => {
                        setFilteredLocationsByExternalID(locations);
                    });
                }
            } else if (!hasURLParameters) {
                window.mapsindoors.services.LocationsService.getLocationsByExternalId(externalIDs ? externalIDs : []).then(locations => {
                    setFilteredLocationsByExternalID(locations);
                });
            } else {
                setFilteredLocationsByExternalID([]);
            }
        }
    }, [externalIDs, mapsindoorsSDKAvailable, hasURLParameters]);

    /*
     * React on changes to the locationId prop.
     * Set as current location and change the venue according to the venue that the location belongs to.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            if (hasURLParameters) {
                if (locationId) {
                    setLocationId(locationIdParameter ? locationIdParameter : locationId);
                    window.mapsindoors.services.LocationsService.getLocation(locationIdParameter ? locationIdParameter : locationId).then(location => {
                        if (location) {
                            setCurrentVenueName(location.properties.venueId);
                            setCurrentLocation(location);
                        }
                    });
                } else {
                    setLocationId(locationIdParameter ? locationIdParameter : '');
                    window.mapsindoors.services.LocationsService.getLocation(locationIdParameter ? locationIdParameter : '').then(location => {
                        if (location) {
                            setCurrentVenueName(location.properties.venueId);
                            setCurrentLocation(location);
                        }
                    });
                }
            } else {
                setLocationId(locationId ? locationId : '');
                window.mapsindoors.services.LocationsService.getLocation(locationId ? locationId : '').then(location => {
                    if (location) {
                        setCurrentVenueName(location.properties.venueId);
                        setCurrentLocation(location);
                    }
                });
            }
        }
    }, [locationId, mapsindoorsSDKAvailable, hasURLParameters]);

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
        if (hasURLParameters) {
            if (venue) {
                setCurrentVenueName(venueParameter ? venueParameter : venue)
            } else {
                setCurrentVenueName(venueParameter ? venueParameter : 'WEWORK')
            }
        } else {
            setCurrentVenueName(venue ? venue : 'WEWORK')
        }
    }, [venue, hasURLParameters]);

    /*
     * React on changes in the tile style prop.
     */
    useEffect(() => {
        if (hasURLParameters) {
            if (tileStyle) {
                setTileStyle(tileStyleParameter ? tileStyleParameter : tileStyle)
            } else {
                setTileStyle(tileStyleParameter ? tileStyleParameter : undefined)
            }
        } else {
            setTileStyle(tileStyle ? tileStyle : undefined)
        }
    }, [tileStyle, hasURLParameters]);

    /*
     * React on changes in the primary color prop.
     */
    useEffect(() => {
        if (hasURLParameters) {
            if (primaryColor) {
                setPrimaryColor(primaryColorParameter ? hexPrimaryColorParameter : primaryColor)
            } else {
                setPrimaryColor(primaryColorParameter ? hexPrimaryColorParameter : '#005655')
            }
        } else {
            setPrimaryColor(primaryColor ? primaryColor : '#005655')
        }
    }, [primaryColor, hasURLParameters]);

    /*
     * React on changes in the start zoom level prop.
     */
    useEffect(() => {
        if (hasURLParameters) {
            if (startZoomLevel) {
                setStartZoomLevel(startZoomLevelParameter ? startZoomLevelParameter : startZoomLevel)
            } else {
                setStartZoomLevel(startZoomLevelParameter ? startZoomLevelParameter : '')
            }
        } else {
            setStartZoomLevel(startZoomLevel ? startZoomLevel : '')
        }
    }, [startZoomLevel, hasURLParameters]);

    /*
     * React on changes in the logo prop.
     */
    useEffect(() => {
        if (hasURLParameters) {
            if (logo) {
                setLogo(logoParameter ? logoParameter : logo)
            } else {
                setLogo(logoParameter ? logoParameter : defaultLogo)
            }
        } else {
            setLogo(logo ? logo : defaultLogo)
        }
    }, [logo, hasURLParameters]);


    /**
     * Get directions to depending on URL Parameters.
     * 
     * @returns {object}
     */
    function getDirectionsTo() {
        if (hasURLParameters) {
            if (directionsTo) {
                return directionsToParameter ? directionsToLocationParameter : directionsToLocation
            } else {
                return directionsToParameter ? directionsToLocationParameter : ''
            }
        } else {
            return directionsTo ? directionsToLocation : ''
        }
    }

    /**
    * Get directions from depending on URL Parameters.
    * 
    * @returns {object}
    */
    function getDirectionsFrom() {
        if (hasURLParameters) {
            if (directionsFrom) {
                return directionsFromParameter ? directionsFromLocationParameter : directionsFromLocation
            } else {
                return directionsFromParameter ? directionsFromLocationParameter : ''
            }
        } else {
            return directionsFrom ? directionsFromLocation : ''
        }
    }

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
                const appConfigCategory = appConfigRef.current?.menuInfo.mainmenu.find(category => category.categoryKey === key);

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
        {!isMapReady && <SplashScreen />}
        {venues.length > 1 && <VenueSelector
            onOpen={() => pushAppView(appStates.VENUE_SELECTOR)}
            onClose={() => goBack()}
            active={currentAppView === appStates.VENUE_SELECTOR}
        />}
        {isMapReady &&
            <>
                {isDesktop &&
                    <Sidebar
                        directionsFromLocation={getDirectionsFrom()}
                        directionsToLocation={getDirectionsTo()}
                        pushAppView={pushAppView}
                        currentAppView={currentAppView}
                        appViews={appStates}
                    />
                }
                {isMobile &&
                    <BottomSheet
                        directionsFromLocation={getDirectionsFrom()}
                        directionsToLocation={getDirectionsTo()}
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
