import './App.css';
import MapsIndoorsMap from './components/MapsIndoorsMap/MapsIndoorsMap';

function App() {
    return (
        <div className="app">
            {/* This is the Map Template component */}
            <MapsIndoorsMap supportsUrlParameters={true}
                gmApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN} 
                apiKey='c6260c238cee496b8a0453e9'
                kioskOriginLocationId='4ed6b21ddcc54f61a18ec7b1'
                primaryColor='#FFF000'
                logo='https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_7a75ff13f42605422950b411ab7e03b5/mapspeople.png'
                />
        </div>
    );
}

export default App;

