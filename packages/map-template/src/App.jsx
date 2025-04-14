import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey="AIzaSyA5w4TjF_18glN6LRCkbNweUoEHNpARdy8"
                // apiKey="13355626fe0c4e42ad16518c"
                // mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });