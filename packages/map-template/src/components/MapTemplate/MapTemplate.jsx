import { Fragment, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import i18n from 'i18next';
import initI18n from '../../i18n/initialize.js';
import './MapTemplate.scss';
import { mapClickActions } from '../../constants/mapClickActions.js';
import MapWrapper from '../MapWrapper/MapWrapper';
import SplashScreen from '../SplashScreen/SplashScreen';
import VenueSelector from '../VenueSelector/VenueSelector';
import BottomSheet from '../BottomSheet/BottomSheet';
import apiKeyState from '../../atoms/apiKeyState';
import gmApiKeyState from '../../atoms/gmApiKeyState';
import isMapReadyState from '../../atoms/isMapReadyState.js';
import currentLocationState from '../../atoms/currentLocationState';
import tileStyleState from '../../atoms/tileStyleState';
import categoriesState from '../../atoms/categoriesState';
import venuesInSolutionState from '../../atoms/venuesInSolutionState';
import solutionState from '../../atoms/solutionState.js';
import { useAppHistory } from '../../hooks/useAppHistory';
import { useReset } from '../../hooks/useReset.js';
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
import qrCodeLinkState from '../../atoms/qrCodeLinkState.js';
import QRCodeDialog from '../QRCodeDialog/QRCodeDialog';
import supportsUrlParametersState from '../../atoms/supportsUrlParametersState';
import useKeyboardState from '../../atoms/useKeyboardState';
import { useIsDesktop } from '../../hooks/useIsDesktop.js';
import miTransitionLevelState from '../../atoms/miTransitionLevelState.js';
import selectedCategoryState from '../../atoms/selectedCategoryState.js';
import LegendDialog from '../LegendDialog/LegendDialog.jsx';
import isLegendDialogVisibleState from '../../atoms/isLegendDialogVisibleState.js';
import searchAllVenuesState from '../../atoms/searchAllVenues.js';
import categoryState from '../../atoms/categoryState.js';
import hideNonMatchesState from '../../atoms/hideNonMatchesState.js';
import appConfigState from '../../atoms/appConfigState.js';
import { useCurrentVenue } from '../../hooks/useCurrentVenue.js';
import showExternalIDsState from '../../atoms/showExternalIDsState.js'
import showRoadNamesState from '../../atoms/showRoadNamesState.js';
import searchExternalLocationsState from '../../atoms/searchExternalLocationsState.js';
import wayfindingLocationState from '../../atoms/wayfindingLocation.js';
import isNullOrUndefined from '../../helpers/isNullOrUndefined.js';
import centerState from '../../atoms/centerState.js';
import PropTypes from 'prop-types';
import { ZoomLevelValues } from '../../constants/zoomLevelValues.js';
import { useOnRouteFinished } from '../../hooks/useOnRouteFinished.js';
import notificationMessageState from '../../atoms/notificationMessageState.js';

// Define the Custom Elements from our components package.
defineCustomElements();

MapTemplate.propTypes = {
    apiKey: PropTypes.string.isRequired,
    gmApiKey: PropTypes.string,
    mapboxAccessToken: PropTypes.string,
    venue: PropTypes.string,
    locationId: PropTypes.string,
    primaryColor: PropTypes.string,
    logo: PropTypes.string,
    appUserRoles: PropTypes.arrayOf(PropTypes.string),
    directionsFrom: PropTypes.string,
    directionsTo: PropTypes.string,
    externalIDs: PropTypes.arrayOf(PropTypes.string),
    tileStyle: PropTypes.string,
    startZoomLevel: PropTypes.number,
    bearing: PropTypes.number,
    pitch: PropTypes.number,
    gmMapId: PropTypes.string,
    useMapProviderModule: PropTypes.bool,
    kioskOriginLocationId: PropTypes.string,
    language: PropTypes.string,
    timeout: PropTypes.number,
    useKeyboard: PropTypes.bool,
    miTransitionLevel: PropTypes.number,
    category: PropTypes.string,
    searchAllVenues: PropTypes.bool,
    hideNonMatches: PropTypes.bool,
    showExternalIDs: PropTypes.bool,
    showRoadNames: PropTypes.bool,
    searchExternalLocations: PropTypes.bool,
    supportsUrlParameters: PropTypes.bool,
    center: PropTypes.string,
    useAppTitle: PropTypes.bool,
    showMapMarkers: PropTypes.bool,
    mapboxMapStyle: PropTypes.string,
    devicePosition: PropTypes.object
};

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
 * @param {string} [props.language] - The language to show textual content in. Supported values are "en" for English, "da" for Danish, "de" for German, "fr" for French, "it" for Italian, "es" for Spanish, "nl" for Dutch and "zh" for Chinese. If the prop is not set, the language of the browser will be used (if it is one of the supported languages - otherwise it will default to English).
 * @param {boolean} [props.supportsUrlParameters] - Set to true if you want to support URL Parameters to configure the Map Template.
 * @param {boolean} [props.useKeyboard] - If running the Map Template as a kiosk, set this prop to true and it will prompt a keyboard.
 * @param {number} [props.timeout] - If you want the Map Template to reset map position and UI elements to the initial state after some time of inactivity, use this to specify the number of seconds of inactivity before resetting.
 * @param {number} [props.miTransitionLevel] - The zoom level on which to transition from Mapbox to MapsIndoors data. Default value is 17. This feature is only available for Mapbox.
 * @param {boolean} [props.searchAllVenues] - If you want to perform search across all venues in the solution.
 * @param {boolean} [props.hideNonMatches] - Determine whether the locations on the map should be filtered (only show the matched locations and hide the rest) or highlighted (show all locations and highlight the matched ones with a red dot by default). If set to true, the locations will be filtered.
 * @param {boolean} [props.showRoadNames] - A boolean parameter that dictates whether Mapbox road names should be shown. By default, Mapbox road names are hidden when MapsIndoors data is shown. It is dictated by `mi-transition-level` which default value is 17.
 * @param {boolean} [props.showExternalIDs] - Determine whether the location details on the map should have an external ID visible. The default value is set to false.
 * @param {boolean} [props.searchExternalLocations] - If you want to perform search for external locations in the Wayfinding mode. If set to true, Mapbox/Google places will be displayed depending on the Map Provider you are using. If set to false, the results returned will only be MapsIndoors results. The default is true.
 * @param {string} [props.center] - Specifies the coordinates where the map should load, represented as longitude and latitude values separated by a comma. If the specified coordinates intersect with a Venue, that Venue will be set as the current Venue.
 * @param {boolean} [props.useAppTitle] - Specifies if the Map Template should set the document title as defined in the App Config. The default value is set to false.
 * @param {boolean} [props.showMapMarkers] - Specifies if the Map Template should show the base map providers Map Markers. The default value is set to true.
 * @param {string} [props.mapboxMapStyle] - Specifies the Mapbox Map Style to use. The default value is set to "mapbox://styles/mapbox/standard".
 */
function MapTemplate({ apiKey, gmApiKey, mapboxAccessToken, venue, locationId, primaryColor, logo, appUserRoles, directionsFrom, directionsTo, externalIDs, tileStyle, startZoomLevel, bearing, pitch, gmMapId, useMapProviderModule, kioskOriginLocationId, language, supportsUrlParameters, useKeyboard, timeout, miTransitionLevel, category, searchAllVenues, hideNonMatches, showRoadNames, showExternalIDs, searchExternalLocations, center, useAppTitle, showMapMarkers, mapboxMapStyle, devicePosition }) {

    const [userSelectedLanguage, setUserSelectedLanguage] = useState(false);
    const [mapOptions, setMapOptions] = useState({ brandingColor: primaryColor });
    const [, setApiKey] = useRecoilState(apiKeyState);
    const [, setGmApiKey] = useRecoilState(gmApiKeyState);
    const [, setMapboxAccessToken] = useRecoilState(mapboxAccessTokenState);
    const [isMapReady, setMapReady] = useRecoilState(isMapReadyState);
    const [venuesInSolution, setVenuesInSolution] = useRecoilState(venuesInSolutionState);
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const categories = useRecoilValue(categoriesState);
    const [, setLocationId] = useRecoilState(locationIdState);
    const [color, setPrimaryColor] = useRecoilState(primaryColorState);
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
    const [, setSelectedCategory] = useRecoilState(selectedCategoryState);
    const [, setSearchAllVenues] = useRecoilState(searchAllVenuesState);
    const [, setCategory] = useRecoilState(categoryState);
    const [, setHideNonMatches] = useRecoilState(hideNonMatchesState);
    const [, setshowExternalIDs] = useRecoilState(showExternalIDsState);
    const [, setShowRoadNames] = useRecoilState(showRoadNamesState);
    const [, setSearchExternalLocations] = useRecoilState(searchExternalLocationsState);
    const [, setCenter] = useRecoilState(centerState);
    const [viewModeSwitchVisible, setViewModeSwitchVisible] = useState();
    const mapClickActionRef = useRef();
    const [, setWayfindingLocation] = useRecoilState(wayfindingLocationState);
    const qrCodeLink = useRecoilValue(qrCodeLinkState)

    const [showVenueSelector, setShowVenueSelector] = useState(true);
    const [showPositionControl, setShowPositionControl] = useState(true);

    const directionsFromLocation = useLocationForWayfinding(directionsFrom);
    const directionsToLocation = useLocationForWayfinding(directionsTo);

    const [isMapPositionInvestigating, setIsMapPositionInvestigating] = useState(false);

    // The filtered locations by external id, if present.
    const [, setFilteredLocationsByExternalID] = useRecoilState(filteredLocationsByExternalIDState);

    // The filtered locations that the user sets when selecting a category/location.
    const [filteredLocations, setFilteredLocations] = useRecoilState(filteredLocationsState);

    // Holds a copy of the initially filtered locations.
    const [initialFilteredLocations, setInitialFilteredLocations] = useState();

    const [appConfig, setAppConfig] = useRecoilState(appConfigState);
    const [, setSolution] = useRecoilState(solutionState);

    const [, setTileStyle] = useRecoilState(tileStyleState);
    const [, setStartZoomLevel] = useRecoilState(startZoomLevelState);

    const [, setBearing] = useRecoilState(bearingState);
    const [, setPitch] = useRecoilState(pitchState);

    const isDesktop = useIsDesktop();
    const resetState = useReset();
    const [pushAppView, goBack, currentAppView, currentAppViewPayload, appStates, resetAppHistory] = useAppHistory();

    // Indicate if the MapsIndoors JavaScript SDK is available.
    const [mapsindoorsSDKAvailable, setMapsindoorsSDKAvailable] = useState(false);

    const showLegendDialog = useRecoilValue(isLegendDialogVisibleState);

    // The reset count is used to add a new key to the sidebar or bottomsheet, forcing it to re-render from scratch when resetting the Map Template.
    const [resetCount, setResetCount] = useState(0);

    const [setCurrentVenueName, updateCategories] = useCurrentVenue();

    const finishRoute = useOnRouteFinished();
    const [, setErrorMessage] = useRecoilState(notificationMessageState);

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
            miSdkApiTag.setAttribute('src', 'https://app.mapsindoors.com/mapsindoors/js/sdk/4.46.1/mapsindoors-4.46.1.js.gz');
            miSdkApiTag.setAttribute('integrity', 'sha384-UIZ8ZRvII99qxHaf7YG0mGf2g6idRr6YDVpCQkVeP+zJntNk6m+aZZ4ekFVghmDH');
            miSdkApiTag.setAttribute('crossorigin', 'anonymous');
            document.body.appendChild(miSdkApiTag);
            miSdkApiTag.onload = () => {
                resolve();
            }
        });
    }

    // On initial load, set currentLanguage from URL prop or appConfig if not already set by user.
    // This allows user selection to always take precedence after first interaction.
    // Note: On reload, language will revert to URL or appConfig unless user selects again.
    useEffect(() => {
        if (!currentLanguage) {
            if (language) {
                setCurrentLanguage(language);
            } else if (appConfig?.appSettings?.language) {
                setCurrentLanguage(appConfig.appSettings.language);
            }
        }
    }, [language, appConfig, currentLanguage, setCurrentLanguage]);

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

        return () => {
            setInitialFilteredLocations();
        }
    }, []);

    /*
     * React on changes in the currentLanguage (from Recoil).
     * If it is undefined, try to use the browser language. It will fall back to English if the language is not supported.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            // Sets language to use. Priority: currentLanguage -> language prop -> App Config -> browser's default language.
            const languageToUse = currentLanguage ?? language ?? appConfig?.appSettings?.language ?? navigator.language;

            // Set the language on the MapsIndoors SDK in order to get eg. Mapbox and Google directions in that language.
            // The MapsIndoors data only accepts the first part of the IETF language string, hence the split.
            window.mapsindoors.MapsIndoors.setLanguage(languageToUse.split('-')[0]);

            // If relevant, fetch venues, categories and the current location again to get them in the new language
            window.mapsindoors.services.LocationsService.once('update_completed', () => {
                if (categories.length > 0) {
                    updateCategories();
                }

                if (venuesInSolution.length > 0) {
                    window.mapsindoors.services.VenuesService.getVenues().then(venuesResult => {
                        venuesResult = venuesResult.map(venue => {
                            venue.image = appConfig.venueImages[venue.name.toLowerCase()];
                            return venue;
                        });
                        setVenuesInSolution(venuesResult);
                    });
                }

                if (currentLocation) {
                    window.mapsindoors.services.LocationsService.getLocation(currentLocation.id).then(location => setCurrentLocation(location));
                }
            });

            // Ensure MapsIndoors uses the user's selected language if supported,
            // so all map content and UI are localized accordingly.
            if (!i18n.language || i18n.language !== languageToUse) {
                if (!i18n.isInitialized) {
                    initI18n(languageToUse);
                } else {
                    i18n.changeLanguage(languageToUse);
                }
            }
        }
    }, [currentLanguage, language, mapsindoorsSDKAvailable, appConfig]);

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
                setVenuesInSolution(venuesResult);
            });
            setMapReady(false);
        }
    }, [apiKey, mapsindoorsSDKAvailable]);

    /*
     * Set map provider access token / API key based on props and app config.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable && appConfig) {
            if (
                isNullOrUndefined(mapboxAccessToken) &&
                isNullOrUndefined(gmApiKey) &&
                isNullOrUndefined(appConfig?.appSettings?.mapboxAccessToken) &&
                isNullOrUndefined(appConfig?.appSettings?.gmKey)
            ) {
                setErrorMessage({ text: 'Please provide a Mapbox Access Token or Google Maps API key to show a map.', type: 'error' });
            } else {
                setMapboxAccessToken(mapboxAccessToken || appConfig.appSettings?.mapboxAccessToken);
                setGmApiKey(gmApiKey || appConfig.appSettings?.gmKey);
            }
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
     * React to changes in the currentAppView in order to set various global states.
     *
     * We need to use a ref for the map click action, as it is used in the locationClicked function,
     * which is caused by a MapsIndoors JS SDK event, which comes with the risk of reading stale state.
     */
    useEffect(() => {
        switch (currentAppView) {
            case appStates.SEARCH:
            case appStates.EXTERNALIDS:
            case appStates.VENUE_SELECTOR:
                mapClickActionRef.current = mapClickActions.SetCurrentLocation;
                break;
            case appStates.LOCATION_DETAILS:
                if (currentAppViewPayload && !currentLocation) {
                    // If there is a history payload and the current location is not set, set it
                    setCurrentLocation(currentAppViewPayload);
                }
                mapClickActionRef.current = mapClickActions.SetCurrentLocation;
                break;
            case appStates.WAYFINDING:
                mapClickActionRef.current = mapClickActions.SetWayfindingLocation;
                break;
            case appStates.DIRECTIONS:
                mapClickActionRef.current = mapClickActions.None;
                break;
        }

        // Reset all the filters when in directions mode.
        // Store the filtered locations in another state, to be able to access them again.
        if (currentAppView === appStates.DIRECTIONS) {
            setInitialFilteredLocations(filteredLocations)
            setFilteredLocations([]);
        } else {
            // Apply the previously filtered locations to the map when navigating outside the directions.
            setFilteredLocations(initialFilteredLocations);
        }
    }, [currentAppView]);

    /*
     * React on changes in the venue prop. If not defined, check if it is defined in app config.
     */
    useEffect(() => {
        setCurrentVenueName(venue ?? appConfig?.appSettings?.venue);
    }, [venue, appConfig]);

    /*
     * React on changes in the tile style prop.
     */
    useEffect(() => {
        setTileStyle(tileStyle);
    }, [tileStyle]);

    /*
     * React on changes in the primary color prop. If not defined, check if it is defined in app config. Otherwise set to default color.
     */
    useEffect(() => {
        const defaultPrimaryColor = '#003C3B'; // --brand-colors-dark-pine-100 from MIDT
        setPrimaryColor(primaryColor ?? appConfig?.appSettings?.primaryColor ?? defaultPrimaryColor);
    }, [primaryColor, appConfig]);

    /*
     * React on changes in the map options props (primary color, showRoadNames, miTransitionLevel).
     * This effect updates the mapOptions state accordingly.
     */
    useEffect(() => {
        setMapOptions({
            brandingColor: color,
            // Ensure showRoadNames and showMapMarkers are booleans, even if appConfig.appSettings.showRoadNames/showMapMarkers is a string
            showRoadNames:
                showRoadNames !== undefined
                    ? showRoadNames
                    : (typeof appConfig?.appSettings?.showRoadNames === 'string'
                        ? appConfig.appSettings.showRoadNames.toLowerCase() === 'true'
                        : appConfig?.appSettings?.showRoadNames),
            showMapMarkers:
                showMapMarkers !== undefined
                    ? showMapMarkers
                    : (typeof appConfig?.appSettings?.showMapMarkers === 'string'
                        ? appConfig.appSettings.showMapMarkers.toLowerCase() === 'true'
                        : appConfig?.appSettings?.showMapMarkers),
            miTransitionLevel: miTransitionLevel,
            // If ignoreViewportBounds is true, we would like to see the map at the minimum zoom level (World Map).
            minZoom: appConfig?.appSettings?.ignoreViewportBounds ? 1 : ZoomLevelValues.minZoom,
            mapboxMapStyle: appConfig?.appSettings?.mapboxMapStyle || mapboxMapStyle
        })
    }, [primaryColor, showRoadNames, miTransitionLevel, color, showMapMarkers, appConfig]);

    /*
     * React on changes in the start zoom level prop. If not defined, check if it is defined in app config.
     */
    useEffect(() => {
        setStartZoomLevel(startZoomLevel ?? appConfig?.appSettings?.startZoomLevel);
    }, [startZoomLevel, appConfig]);

    /*
     * React on changes in the pitch prop. If not defined, check if it is defined in app config.
     * If the pitch is not set, set it to 45 degrees if the view mode switch is visible.
     */
    useEffect(() => {
        const desiredPitch = pitch ?? appConfig?.appSettings?.pitch ?? null;

        if (!isNullOrUndefined(desiredPitch)) {
            setPitch(desiredPitch);
        } else if (viewModeSwitchVisible) {
            setPitch(45);
        }

    }, [pitch, viewModeSwitchVisible, appConfig]);

    /*
     * React on changes in the bearing prop. If not defined, check if it is defined in app config.
     */
    useEffect(() => {
        setBearing(bearing ?? appConfig?.appSettings?.bearing ?? null);
    }, [bearing, appConfig]);

    /*
     * React on changes in the logo prop. If not defined, check if it is defined in app config. Otherwise set to default logo.
     */
    useEffect(() => {
        const defaultLogo = 'https://app.mapsindoors.com/mapsindoors/gfx/mapspeople-logo/mapspeople-pin.svg';
        if (appConfig) {
            setLogo(logo ?? appConfig?.appSettings?.logo ?? defaultLogo);
        }
    }, [logo, appConfig]);

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
                    mapsIndoorsInstance?.setNonCollidingLocation(kioskLocation)
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
    }, [kioskOriginLocationId, mapsindoorsSDKAvailable, mapsIndoorsInstance]);

    /*
     * React on changes to the timeout prop
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
        if (useKeyboard && kioskOriginLocationId) {
            setUseKeyboard(useKeyboard);
        }
    }, [useKeyboard, kioskOriginLocationId]);

    /*
     * React on changes in the category prop.
     * Check if the category property matches with any of the existing categories.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable && category && categories.find((matched) => matched[0] === category)) {
            setSelectedCategory(category);
        }
    }, [category, categories, mapsindoorsSDKAvailable]);

    /*
     * React on changes to the searchAllVenues prop.
     */
    useEffect(() => {
        setSearchAllVenues(searchAllVenues);
    }, [searchAllVenues]);

    /*
     * React on changes to the hideNonMatches prop.
     */
    useEffect(() => {
        setHideNonMatches(hideNonMatches);
    }, [hideNonMatches]);

    /*
     * React on changes to the showExternalIDs prop.
     */
    useEffect(() => {
        setshowExternalIDs(showExternalIDs);
    }, [showExternalIDs]);

    /*
     * React on changes to the showRoadNames prop.
     */
    useEffect(() => {
        setShowRoadNames(showRoadNames);
    }, [showRoadNames])

    /*
     * React on changes to the searchExternalLocations prop.
     */
    useEffect(() => {
        setSearchExternalLocations(searchExternalLocations);
    }, [searchExternalLocations]);

    /*
     * React on changes to the center prop.
     */
    useEffect(() => {
        setCenter(center ?? appConfig?.appSettings?.center);
    }, [center, appConfig]);

    /*
     * Sets document title based on useAppTitle and appConfig values.
     */
    useEffect(() => {
        if (useAppTitle === true && !isNullOrUndefined(appConfig?.appSettings?.title)) {
            document.title = appConfig.appSettings.title;
        }
    }, [useAppTitle, appConfig])

    /**
     * When map position is known while initializing the data,
     * set map to be ready.
     */
    function mapPositionKnown() {
        if (isMapReady === false) {
            setMapReady(true);
        }
    }

    /**
     * Handle the clicked location on the map.
     *
     * @param {object} location
     */
    function locationClicked(location) {
        switch (mapClickActionRef.current) {
            case mapClickActions.SetCurrentLocation:
                // Do not set the current location if the clicked location is the same as the kioskOriginLocationId,
                // due to the logic of displaying directions right away when selecting a location on the map, when in kiosk mode.
                if (location.id !== kioskOriginLocationId) {
                    setCurrentLocation(location);
                }
                break;
            case mapClickActions.SetWayfindingLocation:
                setWayfindingLocation(location);
                break;
            case mapClickActions.None:
            default:
                // Intentionally left blank.
                break;
        }
    }

    /**
     * Function that handles the reset of the state and UI.
     */
    function resetStateAndUI() {
        resetState();
        resetAppHistory();
        setResetCount(curr => curr + 1); // will force a re-render of bottom sheet and sidebar.
        setSelectedCategory(null); // unselect category when route is finished
    }

    /**
     * Function that handles the finishing of route.
     */
    function onRouteFinish() {
        finishRoute();
        resetAppHistory();
        setResetCount(curr => curr + 1); // will force a re-render of bottom sheet and sidebar.
        setSelectedCategory(null); // unselect category when route is finished
    }

    /*
     * React on changes in the category prop.
     * Check if the category property matches with any of the existing categories.
     * Indicate the existence of the category as a prop or query parameter by setting the "setCategory" to true.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable && category && categories.find((matched) => matched[0] === category)) {
            setSelectedCategory(category);
            setCategory(category);
        }
    }, [category, categories, mapsindoorsSDKAvailable]);

    // On initial load, if a language prop is provided and user hasn't explicitly selected a language,
    // set the current language to the prop value. This allows the URL language to take effect
    // until the user makes a selection. Note: If the page is reloaded, the language will
    // revert to the URL-provided value unless the user selects a different language again.
    useEffect(() => {
        if (!userSelectedLanguage) {
            if (language && currentLanguage !== language) {
                setCurrentLanguage(language);
            } else if (!language && appConfig?.appSettings?.language && currentLanguage !== appConfig.appSettings.language) {
                setCurrentLanguage(appConfig.appSettings.language);
            }
        }
    }, [language, appConfig, currentLanguage, setCurrentLanguage, userSelectedLanguage]);

    return <div className={`mapsindoors-map
    ${currentAppView === appStates.DIRECTIONS ? 'mapsindoors-map--hide-elements' : 'mapsindoors-map--show-elements'}
    ${(venuesInSolution.length > 1 && showVenueSelector) ? '' : 'mapsindoors-map--hide-venue-selector'}
    ${showPositionControl ? 'mapsindoors-map--show-my-position' : 'mapsindoors-map--hide-my-position'}`}>
        <Notification />
        {!isMapReady && <SplashScreen />}
        {venuesInSolution.length > 1 && showVenueSelector && <VenueSelector
            onOpen={() => pushAppView(appStates.VENUE_SELECTOR)}
            onClose={() => goBack()}
            active={currentAppView === appStates.VENUE_SELECTOR}
        />}
        {qrCodeLink && <QRCodeDialog />}
        {showLegendDialog && <LegendDialog />}
        {isMapPositionInvestigating &&
            <Fragment key={resetCount}>
                {isDesktop &&
                    <Sidebar
                        directionsFromLocation={directionsFromLocation}
                        directionsToLocation={directionsToLocation}
                        pushAppView={pushAppView}
                        currentAppView={currentAppView}
                        appViews={appStates}
                        onRouteFinished={() => onRouteFinish()}
                    />
                }
                {!isDesktop &&
                    <BottomSheet
                        directionsFromLocation={directionsFromLocation}
                        directionsToLocation={directionsToLocation}
                        pushAppView={pushAppView}
                        currentAppView={currentAppView}
                        appViews={appStates}
                        onRouteFinished={() => onRouteFinish()}
                    />
                }
            </Fragment>
        }
        <MapWrapper
            useMapProviderModule={useMapProviderModule}
            onMapPositionKnown={() => mapPositionKnown()}
            onMapPositionInvestigating={() => setIsMapPositionInvestigating(true)}
            onLocationClick={(location) => locationClicked(location)}
            onViewModeSwitchKnown={visible => setViewModeSwitchVisible(visible)}
            resetCount={resetCount}
            mapOptions={mapOptions}
            gmMapId={gmMapId}
            isWayfindingOrDirections={currentAppView === appStates.WAYFINDING || currentAppView === appStates.DIRECTIONS}
            currentLanguage={currentLanguage}
            setLanguage={(languageToSet) => {
                setCurrentLanguage(languageToSet);
                setUserSelectedLanguage(true);
            }}
            devicePosition={devicePosition}
        />
    </div>
}

export default MapTemplate;
