import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN} 
                apiKey='c6260c238cee496b8a0453e9'
                kioskOriginLocationId='4ed6b21ddcc54f61a18ec7b1'
                />
        </div>
    );
}

export default App;

