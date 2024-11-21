import './App.css'
import MIMap from '@mapsindoors/react-components/src/components/MIMap/MIMap';
import Header from './Header/Header';

function App() {

    // MapsIndoors Austin Office location
    const center = { lng: -97.74203004999998, lat: 30.360050363249286 };
    // A well fitting zoom level
    const zoom = 17.6;

    return (
        <>
            <Header />
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
