import { useContext, useEffect, useState } from 'react';
import { Loader as GoogleMapsApiLoader } from '@googlemaps/js-api-loader';
import MapContext from '../MapContext';

function GoogleMapsMap({ onMapView, onPositionControl }) {
    const { gmApiKey, bearing, pitch, mapsIndoorsInstance } = useContext(MapContext);
    const [google, setGoogle] = useState();
    const [mapView, setMapView] = useState();
    const [hasPositionControl, setHasPositionControl] = useState(false);
    const [hasFloorSelector, setHasFloorSelector] = useState(false);
    const [hasZoomControl, setHasZoomControl] = useState(false);

    useEffect(() => {
        const loader = new GoogleMapsApiLoader({
            apiKey: gmApiKey,
            version: 'quarterly',
            libraries: ['geometry', 'places']
        });

        loader.load().then(loadedGoogle => {
            setGoogle(loadedGoogle);

            // Initialize Google Maps MapView
            const mapViewOptions = {
                element: document.getElementById('map'),
                disableDefaultUI: true, // Disable Map Type control, Street view control and Zoom controls.
                // Always set a center so the map so the bounds or center can be read from the start.
                center: { lat: 0, lng: 0 },
                // Set a large zoom so we prevent a "zoom 0 glitch" (showing the whole globe temporarily)
                zoom: 21,
                // mapId: gmMapId, TODO
                heading: !isNaN(parseInt(bearing)) ? parseInt(bearing) : 0,
                tilt: !isNaN(parseInt(pitch)) ? parseInt(pitch) : 0,
            };

            const mapViewInstance = new window.mapsindoors.mapView.GoogleMapsView(mapViewOptions);
            setMapView(mapViewInstance);

            // Setup an external directions provider that will be used to calculate directions
            // outside MapsIndoors venues.
            const externalDirectionsProvider = new window.mapsindoors.directions.GoogleMapsProvider();

            onMapView(mapViewInstance, externalDirectionsProvider);
        });
    }, []);

    // Add Floor Selector to the Map when ready.
    useEffect(() => {
        if (mapsIndoorsInstance && mapView && google && !hasPositionControl) {
            const myPositionButtonElement = document.createElement('mi-my-position');
            myPositionButtonElement.mapsindoors = mapsIndoorsInstance;
            mapView.getMap().controls[google.maps.ControlPosition.RIGHT_TOP].push(myPositionButtonElement);
            setHasPositionControl(true);
            onPositionControl(myPositionButtonElement);
        }

        if (mapsIndoorsInstance && mapView && google && !hasFloorSelector) {
            const floorSelectorElement = document.createElement('mi-floor-selector');
            floorSelectorElement.mapsindoors = mapsIndoorsInstance;
            // floorSelectorElement.primaryColor = primaryColor; TODO

            mapView.getMap().controls[google.maps.ControlPosition.RIGHT_TOP].push(floorSelectorElement);
            setHasFloorSelector(true);
        }

        if (mapsIndoorsInstance && mapView && google && !hasZoomControl/* && isDesktop TODO*/) {
            // Enable only the Zoom control
            mapView.getMap().setOptions({
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.DEFAULT,
                    position: google.maps.ControlPosition.RIGHT_TOP,
                }
            });
            setHasZoomControl(true);
        }

    }, [mapsIndoorsInstance, mapView, google, hasFloorSelector, hasPositionControl])

    return <div className="map-container" id="map"></div>
}

export default GoogleMapsMap;
