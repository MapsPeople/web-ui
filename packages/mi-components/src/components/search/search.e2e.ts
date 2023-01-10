import { newE2EPage } from '@stencil/core/testing';

describe('mi-search', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mi-search></mi-search>');

        const element = await page.find('mi-search');
        expect(element).toHaveClass('hydrated');
    });
});
