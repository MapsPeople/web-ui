import { newE2EPage } from '@stencil/core/testing';

describe('mi-route-instructions', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mi-route-instructions></mi-route-instructions>');

        const element = await page.find('mi-route-instructions');
        expect(element).toHaveClass('hydrated');
    });
});
