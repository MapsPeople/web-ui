import MapsIndoorsMap from '@mapsindoors/map-template/dist/mapsindoors-react.es.js';

function App() {

    return (
        <div style={{ height: '100vdh', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '16px', height: '50px', margin: 0 }}>Map Template as an imported React component in a React App. Open <code>App.jsx</code> to configure</h1>
            <div style={{ display: 'block', width: '100%', height: 'calc(100dvh - 50px)' }}>
                <MapsIndoorsMap
                    /* insert your props here, for example apiKey, map tokens etc. */
                />
            </div>
        </div>
    )
}

export default App
