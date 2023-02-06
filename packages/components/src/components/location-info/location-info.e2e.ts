import { newE2EPage } from '@stencil/core/testing';

describe('mi-location-info', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mi-location-info></mi-location-info>');

        const element = await page.find('mi-location-info');
        expect(element).toHaveClass('hydrated');
    });
});
