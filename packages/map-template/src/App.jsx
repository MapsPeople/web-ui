import * as Sentry from "@sentry/react";
import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken="pk.eyJ1IjoibWFwc3Blb3BsZSIsImEiOiJjbGx3OWx4OWwwM2s3M2pzeXBtNGtoN2diIn0.IXKTHejui3rgTzBTxDPQ1w"
                apiKey="a9a29e500c5e46b9a192d9bc"
                startZoomLevel="20"
                pitch="60"
                bearing="0"
                logo="https://storage.googleapis.com/mapsindoors-media/Customers/jpmorganchaselogotext.png"
                primaryColor="#6F3D1D"
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });