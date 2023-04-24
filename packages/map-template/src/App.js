import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap
                apiKey="139e36785edf479b9a413721"
                venue="WEWORK"
                mapboxAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                // gmApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            />
        </div>
    );
}

export default App;
