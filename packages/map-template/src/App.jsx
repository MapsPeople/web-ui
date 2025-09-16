import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';
import { trackPageView } from './analytics';
import { useEffect } from 'react';

function App() {
    // Track page view when app loads
    useEffect(() => {
        trackPageView('MapsIndoors Map Template');
    }, []);

    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            />
        </div>
    );
}

export default App;