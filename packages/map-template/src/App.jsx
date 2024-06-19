import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                mapboxAccessToken='pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbHgyNXgweGcwaXh3MmtwdmhyaWI5OGU1In0.0fXO518hNe2S9u5f84Ydew'
                apiKey="5c30a42387294aa895c83bb1"
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });