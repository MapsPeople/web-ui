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
const gmApiKey = params.get('gmApiKey');
const mapboxAccessToken = params.get('mapboxAccessToken');

// Append the hashtag symbol to the color code (i.e. ffffff)
const primaryColor = params.get('primaryColor');
const hexPrimaryColor = primaryColor ? '#'.concat(primaryColor) : undefined;

// Create an array of elements based on the comma separated values
const appUserRoles = params.get('appUserRoles')?.split(',')

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap
                apiKey={apiKey ? apiKey : 'demo'}
                venue={venue}
                locationId={`${locationId}`}
                primaryColor={hexPrimaryColor}
                logo={logo ? logo : undefined}
                appUserRoles={appUserRoles}
                directionsFrom={directionsFrom}
                directionsTo={directionsTo}
                mapboxAccessToken={mapboxAccessToken ? mapboxAccessToken : process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                gmApiKey={gmApiKey ? gmApiKey : process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            />
        </div>
    );
}

export default App;

