import { Fragment, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import i18n from 'i18next';
import initI18n from '../../i18n/initialize.js';
import './MapTemplate.scss';
import { mapClickActions } from '../../constants/mapClickActions.js';
import MapWrapper from "../MapWrapper/MapWrapper";
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
    timeout: PropTypes.number,
    language: PropTypes.string,
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
    useAppTitle: PropTypes.bool
};

/**
 * Renders a comprehensive MapsIndoors map interface with support for multiple map providers, localization, user roles, directions, filtering, kiosk mode, and extensive UI customization.
 *
 * Integrates MapsIndoors SDK and manages map state, user interactions, and configuration through React hooks and Recoil state. Supports dynamic loading of map providers, venue and location selection, directions, inactivity timeout, and accessibility features such as keyboard support and localization.
 *
 * @param {Object} props - Configuration options for the map template.
 * @param {string} props.apiKey - MapsIndoors API key or solution alias.
 * @param {string} [props.gmApiKey] - Google Maps API key.
 * @param {string} [props.mapboxAccessToken] - Mapbox Access Token.
 * @param {string} [props.venue] - Name of the venue to display initially.
 * @param {string} [props.locationId] - ID of the location to display initially.
 * @param {string} [props.primaryColor] - Custom primary color for UI elements.
 * @param {string} [props.logo] - Custom logo for the splash screen.
 * @param {Array} [props.appUserRoles] - User roles for customizing map behavior.
 * @param {string} [props.directionsFrom] - Location ID or "USER_POSITION" for directions origin.
 * @param {string} [props.directionsTo] - Location ID or "USER_POSITION" for directions destination.
 * @param {Array} [props.externalIDs] - External IDs to filter displayed locations.
 * @param {string} [props.tileStyle] - Map tile style.
 * @param {number} [props.startZoomLevel] - Initial zoom level.
 * @param {number} [props.bearing] - Map bearing.
 * @param {number} [props.pitch] - Map pitch.
 * @param {string} [props.gmMapId] - Google Maps Map ID for custom styles.
 * @param {boolean} [props.useMapProviderModule] - Whether to use solution modules to determine map provider.
 * @param {string} [props.kioskOriginLocationId] - Location ID representing the kiosk origin.
 * @param {string} [props.language] - Language code for localization.
 * @param {boolean} [props.supportsUrlParameters] - Enable support for URL parameters.
 * @param {boolean} [props.useKeyboard] - Enable on-screen keyboard (for kiosk mode).
 * @param {number} [props.timeout] - Inactivity timeout in seconds before UI resets.
 * @param {number} [props.miTransitionLevel] - Zoom level for transitioning from Mapbox to MapsIndoors data.
 * @param {string} [props.category] - Category to select initially.
 * @param {boolean} [props.searchAllVenues] - Enable search across all venues.
 * @param {boolean} [props.hideNonMatches] - Hide non-matching locations on search.
 * @param {boolean} [props.showRoadNames] - Show Mapbox road names.
 * @param {boolean} [props.showExternalIDs] - Show external IDs in location details.
 * @param {boolean} [props.searchExternalLocations] - Enable search for external locations in wayfinding mode.
 * @param {string} [props.center] - Initial map center coordinates as "longitude,latitude".
 * @param {boolean} [props.useAppTitle] - Set document title from app config.
 * @returns {JSX.Element} The rendered map template component.
 */
function MapTemplate({ apiKey, gmApiKey, mapboxAccessToken, venue, locationId, primaryColor, logo, appUserRoles, directionsFrom, directionsTo, externalIDs, tileStyle, startZoomLevel, bearing, pitch, gmMapId, useMapProviderModule, kioskOriginLocationId, language, supportsUrlParameters, useKeyboard, timeout, miTransitionLevel, category, searchAllVenues, hideNonMatches, showRoadNames, showExternalIDs, searchExternalLocations, center, useAppTitle }) {

    const [mapOptions, setMapOptions] = useState({ brandingColor: primaryColor });
    const [, setApiKey] = useRecoilState(apiKeyState);
    const [, setGmApiKey] = useRecoilState(gmApiKeyState);
    const [, setMapboxAccessToken] = useRecoilState(mapboxAccessTokenState);
    const [isMapReady, setMapReady] = useRecoilState(isMapReadyState);
    const [venuesInSolution, setVenuesInSolution] = useRecoilState(venuesInSolutionState);
    const [currentLocation, setCurrentLocation] = useRecoilState(currentLocationState);
    const categories = useRecoilValue(categoriesState);
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
    const isMobile = useMediaQuery('(max-width: 991px)');
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
            miSdkApiTag.setAttribute('src', 'https://app.mapsindoors.com/mapsindoors/js/sdk/4.41.0/mapsindoors-4.41.0.js.gz');
            miSdkApiTag.setAttribute('integrity', 'sha384-3lk3cwVPj5MpUyo5T605mB0PMHLLisIhNrSREQsQHjD9EXkHBjz9ETgopmTbfMDc');
            miSdkApiTag.setAttribute('crossorigin', 'anonymous');
            document.body.appendChild(miSdkApiTag);
            miSdkApiTag.onload = () => {
                resolve();
            }
        });
    }

    /**
     * Updates the map options state by merging new options with existing ones
     * @param {Object} newMapOptions - The new map options to merge with existing options
     * @returns {void}
     */
    const handleMapOptionsChange = (newMapOptions) => {
        setMapOptions(previousMapOptions => ({
            ...previousMapOptions,
            ...newMapOptions,
            minZoom: ZoomLevelValues.minZoom
        }))
    };

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
     * React on changes in the language prop.
     * If it is undefined, try to use the browser language. It will fall back to English if the language is not supported.
     */
    useEffect(() => {
        if (mapsindoorsSDKAvailable) {
            console.log('added log here');
            
            // Sets language to use. Priority: Prop -> App Config -> browser's default language.
            const languageToUse = language ?? appConfig?.appSettings?.language ?? navigator.language;

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

            if (!currentLanguage) {
                // Initialize i18n instance that is used to assist translating in the React components.
                initI18n(languageToUse);
            } else {
                // Change the already set language
                i18n.changeLanguage(languageToUse);
            }


            setCurrentLanguage(languageToUse);
        }
    }, [language, mapsindoorsSDKAvailable, appConfig]);

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
        setMapOptions({ brandingColor: primaryColor ?? appConfig?.appSettings?.primaryColor ?? defaultPrimaryColor })

    }, [primaryColor, appConfig]);

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
                {isMobile &&
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
            onMapOptionsChange={handleMapOptionsChange}
            gmMapId={gmMapId}
            isWayfindingOrDirections={currentAppView === appStates.WAYFINDING || currentAppView === appStates.DIRECTIONS}
        />
    </div>
}

export default MapTemplate;
