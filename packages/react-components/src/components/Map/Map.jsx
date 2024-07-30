import { useEffect, useState } from 'react';
import MapboxMap from './MapboxMap/MapboxMap';
import MapContext from './MapContext';

const mapTypes = {
    Google: 'google',
    Mapbox: 'mapbox'
};

function Map({
    apiKey,
    gmApiKey,
    mapboxAccessToken
}) {

    const [mapsIndoorsInstance, setMapsIndoorsInstance] = useState();
    const [, setDirectionsService] = useState();

    const mapType = mapTypes.Mapbox;

    useEffect(() => {
        if (apiKey) {
            console.log('apiKey', apiKey);
            window.mapsindoors.MapsIndoors.setMapsIndoorsApiKey(apiKey);
        }
    }, [apiKey]);

    const onMapView = async (mapView, externalDirectionsProvider) => {
        setTimeout(() => {
            console.log('go onMapView', apiKey);
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

    return <MapContext.Provider value={{ apiKey, gmApiKey, mapboxAccessToken, mapsIndoorsInstance }}>
        {mapType === mapTypes.Google && <p>Google Maps map</p>}
        {mapType === mapTypes.Mapbox && <MapboxMap onMapView={onMapView} />}
    </MapContext.Provider>
}

export default Map;
