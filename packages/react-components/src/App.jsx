import './App.css'
import MIMap from './components/MIMap/MIMap'

function App() {
    return (
        <>
            <h1>MapsIndoors React Components</h1>
            <hr />
            <MIMap
                apiKey="mapspeople3d"
            />
        </>
    )
}
export default App;
