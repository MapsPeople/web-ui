import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';
import configureMapsIndoorsApiUrls from './helpers/configureMapsIndoorsApiUrls';

configureMapsIndoorsApiUrls(import.meta.env.VITE_MAPSINDOORS_API_URLS);

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            />
        </div>
    );
}

export default App;
