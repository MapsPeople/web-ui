import { newE2EPage } from '@stencil/core/testing';

describe('mi-location-booking', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mi-location-booking></mi-location-booking>');

        const element = await page.find('mi-location-booking');
        expect(element).toHaveClass('hydrated');
    });
});
