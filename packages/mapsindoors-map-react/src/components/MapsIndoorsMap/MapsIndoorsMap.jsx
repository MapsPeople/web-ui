import { useEffect } from 'react';
import { useState } from 'react';
import './MapsIndoorsMap.scss';
import Map from "../Map/Map";
import SplashScreen from '../SplashScreen/SplashScreen';
import VenueSelector from '../VenueSelector/VenueSelector';
import BottomSheet from '../BottomSheet/BottomSheet';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import useMediaQuery from '../../hooks/useMediaQuery';
import Modal from '../Modal/Modal';

const mapsindoors = window.mapsindoors;

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
    const [currentCategories, setCurrentCategories] = useState(new Set());
    const [filteredLocations, setFilteredLocations] = useState();
    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();
    const isDesktop = useMediaQuery('(min-width: 992px)');

    /**
     * When venue is fitted while initializing the data, set map to be ready.
     */
    function venueChangedOnMap() {
        if (isMapReady === false) {
            setMapReady(true);
        }
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
            // All the locations that have categories.
            let locationCategories = [];
            //The unique categories for all the locations.
            let uniqueCategories = new Set();

            // Loop through all the locations and only select the ones that have categories.
            locationsResult.forEach(l => {
                if (Object.keys(l.properties.categories).length > 0) {
                    locationCategories.push(l.properties.categories)
                }
            });

            // Loop through the locations which have categories and create a set of unique categories.
            locationCategories.forEach(item => {
                Object.keys(item).forEach(value => uniqueCategories.add(value));
            });

            setCurrentCategories(uniqueCategories);

            venuesResult = venuesResult.map(venue => {
                venue.image = appConfigResult.venueImages[venue.name.toLowerCase()];
                return venue;
            });
            setVenues(venuesResult);
        });
    }, [apiKey]);


    return (<MapsIndoorsContext.Provider value={mapsIndoorsInstance}>
        <div className="mapsindoors-map">
            {!isMapReady && <SplashScreen logo={logo} primaryColor={primaryColor} />}
            {venues.length > 1 && <VenueSelector onVenueSelected={selectedVenue => setCurrentVenueName(selectedVenue.name)} venues={venues} currentVenueName={currentVenueName} />}
            {isMapReady && isDesktop
                ?
                <Modal
                    currentLocation={currentLocation}
                    setCurrentLocation={setCurrentLocation}
                    currentCategories={currentCategories}
                    onLocationsFiltered={(locations) => setFilteredLocations(locations)}
                />
                :
                <BottomSheet
                    currentLocation={currentLocation}
                    setCurrentLocation={setCurrentLocation}
                    currentCategories={currentCategories}
                    onLocationsFiltered={(locations) => setFilteredLocations(locations)}
                />
            }
            <Map
                apiKey={apiKey}
                gmApiKey={gmApiKey}
                mapboxAccessToken={mapboxAccessToken}
                venues={venues}
                venueName={currentVenueName}
                onVenueChangedOnMap={() => venueChangedOnMap()}
                onMapsIndoorsInstance={(instance) => setMapsIndoorsInstance(instance)}
                onLocationClick={(location) => setCurrentLocation(location)}
                filteredLocationIds={filteredLocations?.map(location => location.id)} />
        </div>
    </MapsIndoorsContext.Provider>)
}

export default MapsIndoorsMap;
