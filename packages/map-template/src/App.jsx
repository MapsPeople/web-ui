import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken="pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbTB6ODFmemwwMngxMmlzZ3Y5NjQybGNxIn0.-vG9FP8YUKjNcR-7JD0_Ng"
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });