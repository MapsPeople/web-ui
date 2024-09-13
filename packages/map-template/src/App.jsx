import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken='pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbTB6czUxaWswOWIwMnRwdTIwM2lvemR1In0.A7dCc2_eio8fZ4IyaJoCvg'
                apiKey="5465afc63a3148b7b852bc4a"
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });