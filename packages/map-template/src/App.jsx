import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap
                apiKey="mapspeople"
                venue="Stigsborgvej"
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                // gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            />
        </div>
    );
}

export default App;
