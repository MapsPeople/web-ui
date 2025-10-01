import MapsIndoorsMap from '../src/components/MapsIndoorsMap/MapsIndoorsMap';
import r2wc from '@r2wc/react-to-web-component';

/*
 * Exports the MapsIndoorsMap React component as a Web Component.
 */

const WebMapsIndoorsMap = r2wc(MapsIndoorsMap, {
    props: {
        apiKey: 'string',
        gmApiKey: 'string',
        mapboxAccessToken: 'string',
        venue: 'string',
        locationId: 'string',
        primaryColor: 'string',
        logo: 'string',
        appUserRoles: 'string',
        directionsFrom: 'string',
        directionsTo: 'string',
        externalIDs: 'json',
        tileStyle: 'string',
        startZoomLevel: 'number',
        gmMapId: 'string',
        supportsUrlParameters: 'boolean',
        bearing: 'number',
        pitch: 'number',
        kioskOriginLocationId: 'string',
        useMapProviderModule: 'boolean',
        timeout: 'number',
        miTransitionLevel: 'number',
        category: 'string',
        language: 'string',
        searchAllVenues: 'boolean',
        useKeyboard: 'boolean',
        hideNonMatches: 'boolean',
        showExternalIDs: 'boolean',
        showRoadNames: 'boolean',
        searchExternalLocations: 'boolean',
        center: 'string',
        useAppTitle: 'boolean',
        showMapMarkers: 'boolean',
        mapboxMapStyle: 'string',
        devicePosition: 'object'
    }
})

window.customElements.define('mapsindoors-map', WebMapsIndoorsMap);
export default WebMapsIndoorsMap;
