import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap
                apiKey="3ddemo"
                venue="WEWORK"
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                // externalIDs={["0.32.05", "0.41.01", "0.47.04"]}
                // gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            />
        </div>
    );
}

export default App;
