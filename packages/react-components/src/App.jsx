import './App.css'
import MIMap from './components/MIMap/MIMap'

function App() {
    return (
        <>
            <h1>MapsIndoors React Components</h1>
            <h2><code>&lt;MIMap /&gt;</code></h2>
            <div style={{ marginLeft: '5vw', width: "90vw", height: "70vh", boxShadow: '0px 0px 20px #000' }}>
                <MIMap
                    apiKey="mapspeople3d"
                    gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                    center={{ lat: 57.05825378109134, lng: 9.951020621279326 }}
                    zoom={19.2}
                />
            </div>
        </>
    )
}
export default App;
