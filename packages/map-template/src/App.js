import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);

    const apiKey = params.get('apiKey');
    const venue = params.get('venue');
    const locationId = params.get('locationId');
    const primaryColor = params.get('primaryColor');
    const hexPrimaryColor = '#'.concat(primaryColor)
    const logo = params.get('logo');
    const appUserRoles = params.get('appUserRoles');
    const mapboxAccessToken = params.get('mapboxAccessToken');
    const gmApiKey = params.get('gmApiKey');

    console.log('query string', queryString);
    console.log('params', params);

    console.log('apiKey', apiKey)
    console.log('venue', venue)
    console.log('locationId', locationId)
    console.log('primaryColor', primaryColor)
    console.log('hexPrimaryColor', hexPrimaryColor)
    console.log('logo', logo)
    console.log('appUserRoles', appUserRoles)
    console.log('mapboxAccessToken', mapboxAccessToken)
    console.log('gmApiKey', gmApiKey)

    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap
                apiKey={apiKey ? apiKey : 'demo'}
                venue={venue}
                locationId={locationId}
                primaryColor={hexPrimaryColor ? hexPrimaryColor : undefined}
                logo={logo ? logo : undefined}
                appUserRoles={appUserRoles}
                mapboxAccessToken={mapboxAccessToken ? mapboxAccessToken : process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
            // gmApiKey={gmApiKey ? gmApiKey : process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            />
        </div>
    );
}

export default App;
