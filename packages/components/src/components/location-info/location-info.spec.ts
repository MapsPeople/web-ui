import { LocationInfo } from './location-info';

describe('mi-location-info', () => {
    afterEach(() => {
        // Reset the global `mapsindoors` mock between tests.
        delete (globalThis as any).mapsindoors;
    });

    it('builds', () => {
        expect(new LocationInfo()).toBeTruthy();
    });

    describe('level word fallback', () => {
        const locationOnFloor1 = {
            properties: {
                floorName: '1',
                externalId: null,
                building: null,
                venue: null,
                subtitle: null,
            },
        };

        it('uses the explicit level prop when provided', () => {
            const component = new LocationInfo();
            component.location = locationOnFloor1;
            component.level = 'Custom';
            expect(component.getInfoString()).toBe('Custom 1');
        });

        it('falls back to a localized default based on the SDK language', () => {
            (globalThis as any).mapsindoors = {
                MapsIndoors: { getLanguage: () => 'zh-Hans' },
            };
            const component = new LocationInfo();
            component.location = locationOnFloor1;
            expect(component.getInfoString()).toBe('楼层 1');
        });

        it('falls back to English when the SDK language is unsupported', () => {
            (globalThis as any).mapsindoors = {
                MapsIndoors: { getLanguage: () => 'jp' },
            };
            const component = new LocationInfo();
            component.location = locationOnFloor1;
            expect(component.getInfoString()).toBe('Level 1');
        });

        it('falls back to English when the global mapsindoors is unavailable', () => {
            const component = new LocationInfo();
            component.location = locationOnFloor1;
            expect(component.getInfoString()).toBe('Level 1');
        });

        it('lets an explicit level override take precedence over the SDK language', () => {
            (globalThis as any).mapsindoors = {
                MapsIndoors: { getLanguage: () => 'zh-Hans' },
            };
            const component = new LocationInfo();
            component.location = locationOnFloor1;
            component.level = 'Etage';
            expect(component.getInfoString()).toBe('Etage 1');
        });
    });
});
