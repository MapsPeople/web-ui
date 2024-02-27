import { Fragment, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import i18n from 'i18next';
import initI18n from '../../i18n/initialize.js';
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
import solutionState from '../../atoms/solutionState.js';
import { useAppHistory } from '../../hooks/useAppHistory';
import { useReset } from '../../hooks/useReset.js';
import useMediaQuery from '../../hooks/useMediaQuery';
import Sidebar from '../Sidebar/Sidebar';
import useLocationForWayfinding from '../../hooks/useLocationForWayfinding';
import locationIdState from '../../atoms/locationIdState';
import mapboxAccessTokenState from '../../atoms/mapboxAccessTokenState';
import filteredLocationsState from '../../atoms/filteredLocationsState';
import filteredLocationsByExternalIDState from '../../atoms/filteredLocationsByExternalIDState';
import kioskOriginLocationIdState from '../../atoms/kioskOriginLocationIdState.js';
import startZoomLevelState from '../../atoms/startZoomLevelState';
import primaryColorState from '../../atoms/primaryColorState';
import logoState from '../../atoms/logoState';
import gmMapIdState from '../../atoms/gmMapIdState';
import bearingState from '../../atoms/bearingState';
import pitchState from '../../atoms/pitchState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import languageState from '../../atoms/languageState.js';
import Notification from '../WebComponentWrappers/Notification/Notification.jsx';
import kioskLocationState from '../../atoms/kioskLocationState';
import timeoutState from '../../atoms/timoutState.js';
import { useInactive } from '../../hooks/useInactive.js';
import showQRCodeDialogState from '../../atoms/showQRCodeDialogState';
import QRCodeDialog from '../QRCodeDialog/QRCodeDialog';
import supportsUrlParametersState from '../../atoms/supportsUrlParametersState';
import venueState from '../../atoms/venueState.js';
import useSetCurrentVenueName from '../../hooks/useSetCurrentVenueName.js';
import useKeyboardState from '../../atoms/useKeyboardState';
import { useIsDesktop } from '../../hooks/useIsDesktop.js';
import miTransitionLevelState from '../../atoms/miTransitionLevelState.js';
import Switch from '../Switch/Switch.jsx';

// Define the Custom Elements from our components package.
defineCustomElements();

/**
 *
 * @param {Object} props
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key if you want to show a Google Maps map. Can also be set in the MapsIndoors App Config as "gmKey" under "appSettings".
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token if you want to show a Mapbox map. Can also be set in the MapsIndoors App Config "mapboxAccessToken" under "appSettings".
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
 * @param {number} [props.bearing] - The bearing of the map as a number. Not recommended for Google Maps with 2D Models.
 * @param {number} [props.pitch] - The pitch of the map as a number. Not recommended for Google Maps with 2D Models.
 * @param {string} [props.gmMapId] - The Google Maps Map ID associated with a specific map style or feature.
 * @param {boolean} [props.useMapProviderModule] - Set to true if the Map Template should take MapsIndoors solution modules into consideration when determining what map type to use.
 * @param {string} [props.kioskOriginLocationId] - If running the Map Template as a kiosk (upcoming feature), provide the Location ID that represents the location of the kiosk.
 * @param {string} [props.language] - The language to show textual content in. Supported values are "en" for English, "da" for Danish, "de" for German and "fr" for French. If the prop is not set, the language of the browser will be used (if it is one of the four supported languages - otherwise it will default to English).
 * @param {boolean} [props.supportsUrlParameters] - Set to true if you want to support URL Parameters to configure the Map Template.
 * @param {boolean} [props.useKeyboard] - If running the Map Template as a kiosk, set this prop to true and it will prompt a keyboard.
 * @param {number} [props.timeout] - If you want the Map Template to reset map position and UI elements to the initial state after some time of inactivity, use this to specify the number of seconds of inactivity before resetting.
 * @param {number} [props.miTransitionLevel] - The zoom level on which to transition from Mapbox to MapsIndoors data. Default value is 17. This feature is only available for Mapbox.
 */
function MapTemplate({ apiKey, gmApiKey, mapboxAccessToken, venue, locationId, primaryColor, logo, appUserRoles, directionsFrom, directionsTo, externalIDs, tileStyle, startZoomLevel, bearing, pitch, gmMapId, useMapProviderModule, kioskOriginLocationId, language, supportsUrlParameters, useKeyboard, timeout, miTransitionLevel }) {

    const [, setApiKey] = useRecoilState(apiKeyState);
    const [, setGmApiKey] = useRecoilState(gmApiKeyState);
    const [, setMapboxAccessToken] = useRecoilState(mapboxAccessTokenState);
    const [isMapReady, setMapReady] = useRecoilState(isMapReadyState);
    const [venues, setVenues] = useRecoilState(venuesState);
    const [, setVenue] = useRecoilState(venueState);
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const [categories, setCategories] = useRecoilState(categoriesState);
    const [, setLocationId] = useRecoilState(locationIdState);
    const [, setPrimaryColor] = useRecoilState(primaryColorState);
    const [, setLogo] = useRecoilState(logoState);
    const [, setGmMapId] = useRecoilState(gmMapIdState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const [currentLanguage, setCurrentLanguage] = useRecoilState(languageState);
    const [, setKioskLocation] = useRecoilState(kioskLocationState);
    const [, setKioskOriginLocationId] = useRecoilState(kioskOriginLocationIdState);
    const [, setTimeoutValue] = useRecoilState(timeoutState);
    const isInactive = useInactive(); // Hook to detect if user is inactive. Used in combination with timeout prop to reset the Map Template to initial values after a specified time.
    const [, setSupportsUrlParameters] = useRecoilState(supportsUrlParametersState);
    const [, setUseKeyboard] = useRecoilState(useKeyboardState);
    const [, setMiTransitionLevel] = useRecoilState(miTransitionLevelState);

    const [showVenueSelector, setShowVenueSelector] = useState(true);
    const [showPositionControl, setShowPositionControl] = useState(true);

    const directionsFromLocation = useLocationForWayfinding(directionsFrom);
    const directionsToLocation = useLocationForWayfinding(directionsTo);

    const [isMapPositionKnown, setIsMapPositionKnown] = useState(false);

    // The filtered locations by external id, if present.
    const [, setFilteredLocationsByExternalID] = useRecoilState(filteredLocationsByExternalIDState);

    // The filtered locations that the user sets when selecting a category/location.
    const [filteredLocations, setFilteredLocations] = useRecoilState(filteredLocationsState);

    // Holds a copy of the initially filtered locations.
    const [initialFilteredLocations, setInitialFilteredLocations] = useState();

    const [appConfig, setAppConfig] = useState();
    const [solution, setSolution] = useRecoilState(solutionState);

    const [, setTileStyle] = useRecoilState(tileStyleState);
    const [, setStartZoomLevel] = useRecoilState(startZoomLevelState);

    const [, setBearing] = useRecoilState(bearingState);
    const [, setPitch] = useRecoilState(pitchState);

    const isDesktop = useIsDesktop();
    const isMobile = useMediaQuery('(max-width: 991px)');
    const resetState = useReset();
    const setCurrentVenueName = useSetCurrentVenueName();
    const [pushAppView, goBack, currentAppView, currentAppViewPayload, appStates, resetAppHistory] = useAppHistory();

    // Declare the reference to the disabled locations.
    const locationsDisabledRef = useRef();

    // Indicate if the MapsIndoors JavaScript SDK is available.
    const [mapsindoorsSDKAvailable, setMapsindoorsSDKAvailable] = useState(false);

    const showQRCodeDialog = useRecoilValue(showQRCodeDialogState);

    // The reset count is used to add a new key to the sidebar or bottomsheet, forcing it to re-render from scratch when resetting the Map Template.
    const [resetCount, setResetCount] = useState(0);

    const [showSwitch, setShowSwitch] = useState(false);

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
            miSdkApiTag.setAttribute('src', 'https://app.mapsindoors.com/mapsindoors/js/sdk/CandidateReleases/4.31.0-rc0/mapsindoors-4.31.0-rc0.js.gz');
            // miSdkApiTag.setAttribute('integrity', 'sha384-QNeuSSN5hFRZ8W3bz+zYa75qLWvbci+FuIzmRbQOmaPMyHi7R9XgQXiFjKYvW2n+');
            // miSdkApiTag.setAttribute('crossorigin', 'anonymous');
            document.body.appendChild(miSdkApiTag);
            miSdkApiTag.onload = () => {
                resolve();
            }
        });
    }

    /*
     * If the app is inactive, run code to reset UI and state.
     */
    useEffect(() => {
        if (isInactive) {
            resetStateAndUI();
        }
    }, [isInactive]);

    /**
     * Wait for the MapsIndoors JS SDK to be initialized, then set the mapsindoorsSDKAvailable state to true.
     */
    useEffect(() => {
        initializeMapsIndoorsSDK().then(() => {
            setMapsindoorsSDKAvailable(true);
        });
    }, []);

    /*
     * React on changes in the language prop.
     * If it is undefined, try to use the browser language. It will fall back to English if the language is not supported.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            const languageToUse = language ? language : navigator.language;

            // Set the language on the MapsIndoors SDK in order to get eg. Mapbox and Google directions in that language.
            window.mapsindoors.MapsIndoors.setLanguage(languageToUse);

            // If relevant, fetch venues, categories and the current location again to get them in the new language
            window.mapsindoors.services.LocationsService.once('update_completed', () => {
                if (categories.length > 0) {
                    getVenueCategories(venue);
                }

                if (venues.length > 0) {
                    window.mapsindoors.services.VenuesService.getVenues().then(venuesResult => {
                        venuesResult = venuesResult.map(venue => {
                            venue.image = appConfig.venueImages[venue.name.toLowerCase()];
                            return venue;
                        });
                        setVenues(venuesResult);
                    });
                }

                if (currentLocation) {
                    window.mapsindoors.services.LocationsService.getLocation(currentLocation.id).then(location => setCurrentLocation(location));
                }
            });

            if (!currentLanguage) {
                // Initialize i18n instance that is used to assist translating in the React components.
                initI18n(languageToUse);
            } else {
                // Change the already set language
                i18n.changeLanguage(languageToUse);
            }

            setCurrentLanguage(languageToUse);
        }
    }, [language, mapsindoorsSDKAvailable]);

    /**
     * React on changes in the MapsIndoors API key by fetching the required data.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            setApiKey(apiKey);

            setMapReady(false);
            window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);

            Promise.all([
                // Fetch all Venues in the Solution
                window.mapsindoors.services.VenuesService.getVenues(),
                // Fetch the App Config belonging to the given API key. This is needed for checking access tokens and Venue images.
                window.mapsindoors.services.AppConfigService.getConfig().then(appConfigResult => {
                    setAppConfig(appConfigResult); // We need this as early as possible
                    return appConfigResult;
                }),
                // Fetch solution info in order to see what modules are enabled
                window.mapsindoors.services.SolutionsService.getSolution().then(solutionResult => {
                    setSolution(solutionResult);
                    return solutionResult;
                }),
                // Ensure a minimum waiting time of 3 seconds
                new Promise(resolve => setTimeout(resolve, 3000))
            ]).then(([venuesResult, appConfigResult]) => {
                venuesResult = venuesResult.map(venue => {
                    venue.image = appConfigResult.venueImages[venue.name.toLowerCase()];
                    return venue;
                });
                setVenues(venuesResult);
            });
            setMapReady(false);
        }
    }, [apiKey, mapsindoorsSDKAvailable]);

    /*
     * Set map provider access token / API key based on props and app config.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable && appConfig) {
            setMapboxAccessToken(mapboxAccessToken || appConfig.appSettings?.mapboxAccessToken);
            setGmApiKey(gmApiKey || appConfig.appSettings?.gmKey);
        }
    }, [gmApiKey, mapboxAccessToken, mapsindoorsSDKAvailable, appConfig]);

    /*
     * React on changes in the app user roles prop.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            window.mapsindoors.services.SolutionsService.getUserRoles().then(userRoles => {
                const roles = userRoles.filter(role => appUserRoles?.includes(role.name));
                window.mapsindoors.MapsIndoors.setUserRoles(roles);
            });
        }
    }, [appUserRoles, mapsindoorsSDKAvailable]);

    /*
     * React on changes in the externalIDs prop.
     * Get the locations by external IDs, if present.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            if (externalIDs) {
                window.mapsindoors.services.LocationsService.getLocationsByExternalId(externalIDs).then(locations => {
                    setFilteredLocationsByExternalID(locations);
                });
            } else {
                setFilteredLocationsByExternalID([]);
            }
        }
    }, [externalIDs, mapsindoorsSDKAvailable]);

    /*
     * React on changes to the locationId prop.
     * Set as current location and change the venue according to the venue that the location belongs to.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            setLocationId(locationId);
            if (locationId) {
                window.mapsindoors.services.LocationsService.getLocation(locationId).then(location => {
                    if (location) {
                        setCurrentVenueName(location.properties.venueId);
                        setCurrentLocation(location);
                    }
                });
            }
        }
    }, [locationId, mapsindoorsSDKAvailable, resetCount]);

    /*
     * React to changes in the gmMapId prop.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            setGmMapId(gmMapId);
        }
    }, [gmMapId, mapsindoorsSDKAvailable]);

    /*
     * Add Location to history payload to make it possible to re-enter location details with that Location.
     */
    useEffect(() => {
        if (currentAppView === appStates.LOCATION_DETAILS && currentAppViewPayload && !currentLocation) {
            setCurrentLocation(currentAppViewPayload);
        }

        locationsDisabledRef.current = currentAppView === appStates.DIRECTIONS;

        // Reset all the filters when in directions mode.
        // Store the filtered locations in another state, to be able to access them again.
        if (locationsDisabledRef.current) {
            setInitialFilteredLocations(filteredLocations)
            setFilteredLocations([]);
        } else {
            // Apply the previously filtered locations to the map when navigating outside the directions.
            setFilteredLocations(initialFilteredLocations);
        }
    }, [currentAppView]);

    /*
     * React on changes in the venue prop.
     */
    useEffect(() => {
        setVenue(venue);
        setCurrentVenueName(venue);
    }, [venue]);

    /*
     * React on changes in the tile style prop.
     */
    useEffect(() => {
        setTileStyle(tileStyle);
    }, [tileStyle]);

    /*
     * React on changes in the primary color prop.
     */
    useEffect(() => {
        setPrimaryColor(primaryColor);
    }, [primaryColor]);

    /*
     * React on changes in the start zoom level prop.
     */
    useEffect(() => {
        setStartZoomLevel(startZoomLevel);
    }, [startZoomLevel]);

    /*
     * React on changes in the pitch prop.
     */
    useEffect(() => {
        setPitch(pitch);
    }, [pitch]);

    /*
     * React on changes in the bearing prop.
     */
    useEffect(() => {
        setBearing(bearing);
    }, [bearing]);

    /*
     * React on changes in the logo prop.
     */
    useEffect(() => {
        setLogo(logo);
    }, [logo]);

    /*
     * React on changes in the miTransitionLevel prop.
     */
    useEffect(() => {
        setMiTransitionLevel(miTransitionLevel);
    }, [miTransitionLevel]);

    /*
     * React on changes in the current location prop.
     * Apply location selection if the current location exists and is not the same as the kioskOriginLocationId.
     */
    useEffect(() => {
        if (currentLocation && currentLocation.id !== kioskOriginLocationId) {
            if (mapsIndoorsInstance?.selectLocation) {
                mapsIndoorsInstance.selectLocation(currentLocation);
            }
        } else {
            if (mapsIndoorsInstance?.deselectLocation) {
                mapsIndoorsInstance.deselectLocation();
            }
        }
    }, [currentLocation]);

    /*
     * React on changes to the kioskOriginLocationId prop.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            setKioskOriginLocationId(kioskOriginLocationId);
            if (kioskOriginLocationId) {
                window.mapsindoors.services.LocationsService.getLocation(kioskOriginLocationId).then(kioskLocation => {
                    setCurrentVenueName(kioskLocation.properties.venueId);
                    setKioskLocation(kioskLocation);
                })
            } else {
                setKioskLocation();
            }

            if (kioskOriginLocationId && isDesktop) {
                setShowVenueSelector(false);
                setShowPositionControl(false);
            } else {
                setShowVenueSelector(true);
                setShowPositionControl(true);
            }
        }
    }, [kioskOriginLocationId, mapsindoorsSDKAvailable]);

    /*
     * React on changes to the timout prop
     */
    useEffect(() => {
        setTimeoutValue(timeout);
    }, [timeout]);

    /*
     * React on changes in the supportsUrlParameters prop.
     */
    useEffect(() => {
        setSupportsUrlParameters(supportsUrlParameters);
    }, [supportsUrlParameters]);

    /*
     * React on changes to the useKeyboard prop.
     * Show keyboard only in a kiosk context.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            if (useKeyboard && kioskOriginLocationId) {
                setUseKeyboard(useKeyboard);
            }
        }
    }, [useKeyboard, kioskOriginLocationId, mapsindoorsSDKAvailable]);

    /*
     * React on changes to the solution.
     * Decide whether to show the Switch component depending on the modules enabled on the solution.
     */
    useEffect(() => {
        if (solution) {
            const isMapboxModuleEnabled = solution.modules.map(module => module.toLowerCase()).includes('mapbox');
            const is3DWallsModuleEnabled = solution.modules.map(module => module.toLowerCase()).includes('3dwalls');
            // The module floorplan refers to 2D Walls 
            const is2DWallsModuleEnabled = solution.modules.map(module => module.toLowerCase()).includes('floorplan');

            if (isMapboxModuleEnabled && is3DWallsModuleEnabled && is2DWallsModuleEnabled) {
                setShowSwitch(true);
            }
        }
    }, [solution]);

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
     * Handle the clicked location on the map. Set the current location if not in directions mode.
     * Do not set the current location if the clicked location is the same as the kioskOriginLocationId,
     * due to the logic of displaying directions right away when selecting a location on the map, when in kiosk mode.
     *
     * @param {object} location
     */
    function locationClicked(location) {
        if (locationsDisabledRef.current !== true && location.id !== kioskOriginLocationId) {
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
     * Function that handles the reset of the state and UI.
     */
    function resetStateAndUI() {
        resetState();
        resetAppHistory();
        setResetCount(curr => curr + 1); // will force a re-render of bottom sheet and sidebar.
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
                const appConfigCategory = appConfig.menuInfo.mainmenu.find(category => category.categoryKey === key);

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

    return <div className={`mapsindoors-map ${locationsDisabledRef.current ? 'mapsindoors-map--hide-elements' : 'mapsindoors-map--show-elements'} ${showPositionControl ? 'mapsindoors-map--show-my-position' : 'mapsindoors-map--hide-my-position'}`}>
        <Notification />
        {!isMapReady && <SplashScreen />}
        {venues.length > 1 && showVenueSelector && <VenueSelector
            onOpen={() => pushAppView(appStates.VENUE_SELECTOR)}
            onClose={() => goBack()}
            active={currentAppView === appStates.VENUE_SELECTOR}
        />}
        {showSwitch && <Switch />}
        {showQRCodeDialog && <QRCodeDialog />}
        {isMapPositionKnown &&
            <Fragment key={resetCount}>
                {isDesktop &&
                    <Sidebar
                        directionsFromLocation={directionsFromLocation}
                        directionsToLocation={directionsToLocation}
                        pushAppView={pushAppView}
                        currentAppView={currentAppView}
                        appViews={appStates}
                        onRouteFinished={() => resetStateAndUI()}
                    />
                }
                {isMobile &&
                    <BottomSheet
                        directionsFromLocation={directionsFromLocation}
                        directionsToLocation={directionsToLocation}
                        pushAppView={pushAppView}
                        currentAppView={currentAppView}
                        appViews={appStates}
                        onRouteFinished={() => resetStateAndUI()}
                    />
                }
            </Fragment>
        }
        <MIMap
            useMapProviderModule={useMapProviderModule}
            onVenueChangedOnMap={(venue) => venueChangedOnMap(venue)}
            onMapPositionKnown={() => setIsMapPositionKnown(true)}
            onLocationClick={(location) => locationClicked(location)}
        />
    </div>
}

export default MapTemplate;
