import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

// The current query string
const queryString = window.location.search;
const params = new URLSearchParams(queryString);

const apiKey = params.get('apiKey');
const venue = params.get('venue');
const locationId = params.get('locationId');
const logo = params.get('logo');
const directionsFrom = params.get('directionsFrom');
const directionsTo = params.get('directionsTo');
const tileStyle = params.get('tileStyle');
const startZoomLevel = params.get('startZoomLevel');
const gmApiKey = params.get('gmApiKey');
const mapboxAccessToken = params.get('mapboxAccessToken');

// Append the hashtag symbol to the color code (i.e. ffffff)
const primaryColor = params.get('primaryColor');

// The HEX value refers to the --brand-colors-dark-pine-100 from MIDT
const hexPrimaryColor = primaryColor ? '#'.concat(primaryColor) : '#005655';

// Create an array of app user roles based on the comma separated values
const appUserRoles = params.get('appUserRoles')?.split(',')

// Create an array of external IDs based on the comma separated values
const externalIDs = params.get('externalIDs')?.split(',')

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap
                apiKey={apiKey ? apiKey : '3ddemo'}
                venue={venue ? venue : 'WEWORK'}
                locationId={locationId}
                primaryColor={hexPrimaryColor}
                logo={logo ? logo : undefined}
                appUserRoles={appUserRoles}
                directionsFrom={directionsFrom}
                directionsTo={directionsTo}
                externalIDs={externalIDs}
                tileStyle={tileStyle}
                startZoomLevel={startZoomLevel}
                mapboxAccessToken={mapboxAccessToken ? mapboxAccessToken : import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                gmApiKey={gmApiKey ? gmApiKey : import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            />
        </div>
    );
}

export default App;

