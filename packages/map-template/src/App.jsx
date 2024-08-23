import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                apiKey="4dabfbf824f247afad1ee8d2"
                startZoomLevel={17}
                pitch={70}
                bearing={45}
                logo="https://www.milcorp.com/assets/Dream-Force-logo.png"
                primaryColor="#00A0E0"
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });