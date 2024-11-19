import './App.css'
import MIMap from '@mapsindoors/react-components/src/components/MIMap/MIMap';

function App() {

    const center = { lng: -97.74203004999998, lat: 30.360050363249286 };
    const zoom = 17.6;

    return (
        <>
            <header>
                <h1>MapsIndoors Office Demo</h1>
            </header>
            <main>
                <MIMap
                    apiKey="mapspeople3d"
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                    center={center}
                    zoom={zoom}
                />
            </main>
        </>
    )
}

export default App
