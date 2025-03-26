import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <Sentry.ErrorBoundary>
            <div className="app">
                {/* This is the Map Template component */}
                <MapsIndoorsMap supportsUrlParameters={true}
                    gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                />
            </div>
        </Sentry.ErrorBoundary>
    );
}

export default Sentry.withProfiler(App, { name: "App" });