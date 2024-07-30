import './App.css'
import Map from './components/Map/Map';

function App() {
    return (
        <div className="app">
            <h1>MapsIndoors React Components</h1>
            <hr />
            <h2>Map</h2>
            <div className="map-container">
                <Map
                    apiKey="mapspeople3d"
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                />
            </div>
        </div>
    )
}

export default App
