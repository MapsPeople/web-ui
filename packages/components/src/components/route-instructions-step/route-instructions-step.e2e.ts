import { newE2EPage } from '@stencil/core/testing';

describe('mi-route-instructions-step', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mi-route-instructions-step></mi-route-instructions-step>');

        const element = await page.find('mi-route-instructions-step');
        expect(element).toHaveClass('hydrated');
    });
});
