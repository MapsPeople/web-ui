import { useEffect, useState } from 'react';
import { DirectionsServiceContext } from '../../DirectionsServiceContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import { MapReadyContext } from '../../MapReadyContext';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import BottomSheet from '../BottomSheet/BottomSheet';
import MIMap from "../Map/Map";
import Sidebar from '../Sidebar/Sidebar';
import SplashScreen from '../SplashScreen/SplashScreen';
import VenueSelector from '../VenueSelector/VenueSelector';
import './MapsIndoorsMap.scss';

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
     * Get the unique categories and the count of the categories with locations associated.
     *
     * @param {array} locationsResult
     */
    function getCategories(locationsResult) {
        let uniqueCategories = locationsResult
            // Flatten the locations result to get a new array of locations that have categories.
            .flatMap(location => Object.values(location.properties.categories ?? {}))

            // Reduce the array of elements in order to get a new Map with elements and the count of categories with locations associated.
            .reduce((categories, category) => {
                if (categories.has(category)) {
                    let count = categories.get(category);
                    categories.set(category, ++count);
                } else {
                    categories.set(category, 1);
                }
                return categories;
            }, new Map());

        // Sort the categories with most locations associated.
        uniqueCategories = Array.from(uniqueCategories).sort((a, b) => b[1] - a[1])

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
            // Fetch all Locations
            mapsindoors.services.LocationsService.getLocations({}),
            // Ensure a minimum waiting time of 3 seconds
            new Promise(resolve => setTimeout(resolve, 3000))
        ]).then(([venuesResult, appConfigResult, locationsResult]) => {
            getCategories(locationsResult);
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
