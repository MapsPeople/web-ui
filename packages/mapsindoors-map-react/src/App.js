import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            <h1>MapsIndoors Map</h1>
            <mi-icon icon-name="marker"></mi-icon>
            <div className="app__map-container">
                {/* This is the Map Template component */}
                <MapsIndoorsMap
                    apiKey="mapspeople"
                    mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                />
            </div>
        </div>
    );
}

export default App;
