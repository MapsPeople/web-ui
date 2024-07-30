import { useContext, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapContext from '../MapContext';

function MapboxMap({ onMapView, /* onPositionControl */}) {

    const { mapboxAccessToken, bearing, pitch, mapsIndoorsInstance } = useContext(MapContext);

    const [mapView, setMapView] = useState();

    const [hasFloorSelector, setHasFloorSelector] = useState(false);
    const [hasPositionControl, setHasPositionControl] = useState(false);
    const [hasZoomControl, setHasZoomControl] = useState(false);

    useEffect(() => {
        // Initialize MapboxV3View MapView
        window.mapboxgl = mapboxgl;
        const mapViewOptions = {
            accessToken: mapboxAccessToken,
            element: document.getElementById('map'),
            bearing: !isNaN(parseInt(bearing)) ? parseInt(bearing) : 0,
            pitch: !isNaN(parseInt(pitch)) ? parseInt(pitch) : 0,
            // The MapsIndoors SDK needs a starting point and a zoom level to avoid timing issues when setting the venue.
            center: { lat: 0, lng: 0 },
            zoom: 15
        };

        // // If miTransitionLevel exists and it's a number, set it in the mapViewOptions.
        // if (miTransitionLevel && !isNaN(parseInt(miTransitionLevel))) {
        //     mapViewOptions.mapsIndoorsTransitionLevel = parseInt(miTransitionLevel);
        // }

        // // If showRoadNames is not null or undefined, set it as showRoadNames in the mapViewOptions.
        // if (!isNullOrUndefined(showRoadNames)) {
        //     mapViewOptions.showRoadNameLabels = showRoadNames;
        // }

        const mapViewInstance = new window.mapsindoors.mapView.MapboxV3View(mapViewOptions);
        setMapView(mapViewInstance);

        // Setup an external directions provider that will be used to calculate directions
        // outside MapsIndoors venues.
        const externalDirectionsProvider = new window.mapsindoors.directions.MapboxProvider(mapboxAccessToken);

        onMapView(mapViewInstance, externalDirectionsProvider);

        // // Generate a UUIDv4 and set the Session Token for searching for Mapbox places.
        // const uuid = uuidv4();
        // sessionStorage.setItem('mapboxPlacesSessionToken', uuid);
    }, []);

    // Add Floor Selector to the Map when ready.
    useEffect(() => {
        if (mapsIndoorsInstance && mapView && !hasPositionControl) {
            const myPositionButtonElement = document.createElement('mi-my-position');
            myPositionButtonElement.mapsindoors = mapsIndoorsInstance;

            mapView.getMap().addControl({
                onAdd: () => myPositionButtonElement,
                onRemove: function () { }
            }, 'top-right');
            setHasPositionControl(true);
            // onPositionControl(myPositionButtonElement);
        }

        if (mapsIndoorsInstance && mapView && !hasZoomControl /*&& isDesktop*/) {
            mapView
                .getMap()
                .addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

            setHasZoomControl(true);
        }

        if (mapsIndoorsInstance && mapView && !hasFloorSelector) {
            const floorSelectorElement = document.createElement('mi-floor-selector');
            floorSelectorElement.mapsindoors = mapsIndoorsInstance;
            // floorSelectorElement.primaryColor = primaryColor;

            mapView.getMap().addControl({
                onAdd: () => floorSelectorElement,
                onRemove: function () { floorSelectorElement.parentNode.removeChild(floorSelectorElement); }
            }, 'top-right');

            setHasFloorSelector(true);
        }
    }, [mapsIndoorsInstance, mapView]);

    return <div className="map-container" id="map">Mapbox map!</div>
}

export default MapboxMap;
