import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            <header className="app__header">
                <mi-icon icon-name="marker"></mi-icon>
                <h1>MapsIndoors Map</h1>
            </header>

            <div className="app__map-container">
                {/* This is the Map Template component */}
                <MapsIndoorsMap
                    apiKey="mapspeople"
                    venue="Stigsborgvej"
                    mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                    // gmApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                />
            </div>
        </div>
    );
}

export default App;
