import { useEffect, useState } from 'react';
import { defineCustomElements } from '@mapsindoors/components/dist/esm/loader.js';
import MapboxMap from './MapboxMap/MapboxMap';
import GoogleMapsMap from './GoogleMapsMap/GoogleMapsMap';
import MapContext from './MapContext';

// Define the Custom Elements from our components package.
defineCustomElements();// TODO: Why do we need to remove this when we want to use it in the Map Template?

const mapTypes = {
    Google: 'google',
    Mapbox: 'mapbox'
};

function Map({
    apiKey,
    gmApiKey,
    mapboxAccessToken,
    venue, // administrative ID
    onMapReady // callback called when fitVenue resolves
}) {

    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();
    const [, setDirectionsService] = useState();

    const mapType = mapTypes.Mapbox;

    useEffect(() => {
        if (apiKey) {
            window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);
        }
    }, [apiKey]);

    // TODO: Proper design on how map bounds should work
    useEffect(() => {
        if (mapsIndoorsInstance) {
            window.mapsindoors.services.VenuesService.getVenues().then(venuesInSolution => {
                let venueToSet = venuesInSolution.find(v => v.name === venue);
                if (!venueToSet) {
                    // No explicit venue set. Take the first alphabetically
                    venueToSet = [...venuesInSolution].sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); })[0];
                }
                mapsIndoorsInstance.setVenue(venueToSet);
                mapsIndoorsInstance.fitVenue(venueToSet).then(() => {
                    // TODO: Investigate a better alternative as to when to call the onMapReady callback
                    if (typeof onMapReady === 'function') {
                        onMapReady();
                    }
                })
            });
        }
    }, [mapsIndoorsInstance, venue]);

    const onMapView = async (mapView, externalDirectionsProvider) => {
        setTimeout(() => { // yikes 😬 TODO: Invesigate timing issue that is fixed with this workaround.
            // Instantiate MapsIndoors instance
            const miInstance = new window.mapsindoors.MapsIndoors({
                mapView
            });

            // Detect when the mouse hovers over a location and store the hovered location
            // If the location is non-selectable, remove the hovering by calling the unhoverLocation() method.
            miInstance.on('mouseenter', () => {
                const hoveredLocation = miInstance.getHoveredLocation()

                if (hoveredLocation?.properties.locationSettings?.selectable === false) {
                    miInstance.unhoverLocation();
                }
            });

            // TODO: Turn off visibility for building outline for demo purposes until the SDK supports Display Rules for Buildings too.
            miInstance.setDisplayRule(['MI_BUILDING_OUTLINE'], { visible: false });

            // miInstance.on('click', location => onLocationClick(location));
            // miInstance.once('building_changed', () => onBuildingChanged(miInstance))
            // miInstance.on('floor_changed', () => onTileStyleChanged(miInstance));

            setMapsIndoorsInstance(miInstance);

            // Assign the miInstance to the mapsIndoorsInstance on the window interface.
            window.mapsIndoorsInstance = miInstance;

            // Create a custom event that is dispatched from the window interface.
            const event = new CustomEvent('mapsIndoorsInstanceAvailable');
            window.dispatchEvent(event);

            // Initialize a Directions Service
            const directionsService = new window.mapsindoors.services.DirectionsService(externalDirectionsProvider);
            setDirectionsService(directionsService);
        }, 0);
    };

    /**
     * Listen for changes in user position and update state for it.
     *
     * @param {object} positionControl - MapsIndoors PositionControl instance.
     */
    const onPositionControlCreated = positionControl => {
        if (positionControl.nodeName === 'MI-MY-POSITION') {
            // The Web Component needs to set up the listener with addEventListener
            positionControl.addEventListener('position_received', positionInfo => {
                if (positionInfo.detail.accurate === true) {
                    //setUserPosition(positionInfo.detail.position);
                }
            });
        } else {
            positionControl.on('position_received', positionInfo => {
                if (positionInfo.accurate === true) {
                    //setUserPosition(positionInfo.position);
                }
            });
        }
        //setPositionControl(positionControl);
    }

    return <MapContext.Provider value={{ apiKey, gmApiKey, mapboxAccessToken, mapsIndoorsInstance }}>
        {mapType === mapTypes.Google && <GoogleMapsMap onMapView={onMapView} onPositionControl={onPositionControlCreated} />}
        {mapType === mapTypes.Mapbox && <MapboxMap onMapView={onMapView} onPositionControl={onPositionControlCreated} />}
    </MapContext.Provider>
}

export default Map;
