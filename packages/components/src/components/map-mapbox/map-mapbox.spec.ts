import { MapMapbox } from './map-mapbox';

describe('mi-map-mapbox applyBasemapConfig', () => {
    it('does not throw when the Mapbox style is not done loading (MS-3993)', () => {
        const component = new MapMapbox();
        // Mirror mapbox-gl: getStyle() throws "Style is not done loading" until the style has loaded.
        (component as any).mapboxInstance = {
            setConfigProperty: (): void => undefined,
            isStyleLoaded: (): boolean => false,
            getStyle: (): never => {
                throw new Error('Style is not done loading');
            },
        };

        expect(() => component.applyBasemapConfig()).not.toThrow();
    });

    it('applies basemap config once the style is loaded', () => {
        const component = new MapMapbox();
        const configured: string[] = [];
        (component as any).mapboxInstance = {
            isStyleLoaded: (): boolean => true,
            getStyle: (): { imports: { id: string }[] } => ({ imports: [{ id: 'basemap' }] }),
            getConfigProperty: (): number | undefined => undefined,
            setConfigProperty: (_scope: string, key: string): number => configured.push(key),
        };

        component.applyBasemapConfig();

        expect(configured).toContain('showPointOfInterestLabels');
    });
});

describe('mi-map-mapbox setupMap', () => {
    afterEach(() => {
        delete (globalThis as any).mapsindoors;
        delete (globalThis as any).mapboxgl;
    });

    it('does not override the CMS label display rules with labelOptions (MS-4006)', () => {
        const mapsIndoorsOptions: object[] = [];
        const map = { on: (): void => undefined, isStyleLoaded: (): boolean => false, addControl: (): void => undefined };
        // Plain functions called with `new` return these objects; 'ready' never fires in this test.
        (globalThis as any).mapsindoors = {
            mapView: { MapboxV3View: function (): object { return { getMap: (): object => map }; } },
            MapsIndoors: function (options: object): object {
                mapsIndoorsOptions.push(options);
                return { on: (): void => undefined };
            },
        };
        (globalThis as any).mapboxgl = { NavigationControl: class {} };

        void new MapMapbox().setupMap();

        expect(mapsIndoorsOptions).toHaveLength(1);
        expect(mapsIndoorsOptions[0]).not.toHaveProperty('labelOptions');
    });
});
