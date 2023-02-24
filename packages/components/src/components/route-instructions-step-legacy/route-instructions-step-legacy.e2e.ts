import { newE2EPage } from '@stencil/core/testing';

describe('mi-route-instructions-step-legacy', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mi-route-instructions-step-legacy></mi-route-instructions-step-legacy>');

        const element = await page.find('mi-route-instructions-step-legacy');
        expect(element).toHaveClass('hydrated');
    });
});
