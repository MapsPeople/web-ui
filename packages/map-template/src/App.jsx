import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken="pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbTZybW85OHYwMG9tMmtzZjU1enluY2lnIn0.kOx8TmdRgqKWoDQsisBrEQ"
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });