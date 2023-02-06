import { newE2EPage } from '@stencil/core/testing';

describe('chip', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mi-chip></mi-chip>');

        const element = await page.find('mi-chip');
        expect(element).toHaveClass('hydrated');
    });
});
