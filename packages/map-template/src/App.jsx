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
                logo='https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.GwY9O6V1XitdxF5UMGxh8gHaDr%26pid%3DApi&f=1&ipt=683dfb4a14781b0933c7145005c258c0fd28ed7a3525ab023bd22bfe38edf122&ipo=images'
                primaryColor="#A71930"
                miTransitionLevel={10}
                showRoadNames={true}
                />
        </div>
    );
}

export default Sentry.withProfiler(App, { name: "App" });