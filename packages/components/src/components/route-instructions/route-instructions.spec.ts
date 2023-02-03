import { RouteInstructions } from './route-instructions';

describe('mi-route-instructions', () => {
    it('builds', () => {
        expect(new RouteInstructions()).toBeTruthy();
    });
});
