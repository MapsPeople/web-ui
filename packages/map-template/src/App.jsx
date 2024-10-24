import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken={"pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbHhzeHBnZ2gxNGQ0MmpxMzdndjZjYWVzIn0.VCtRQfrZdAdEiAlFYXjGhQ"}
                primaryColor="#EC6500"
                logo="https://storage.googleapis.com/mcm2024/logo.png"
                apiKey="31351079b6c74e2d870d6acc"
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });