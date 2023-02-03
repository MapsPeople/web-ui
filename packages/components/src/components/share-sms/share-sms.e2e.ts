import { newE2EPage } from '@stencil/core/testing';

describe('mi-share-sms', () => {
    const html = '<mi-share-sms venue="899cf628675f4b0695669529" origin="55b732c2607d436594577bf6" destination="8b4e9890e3d048be81dcb36d"></mi-share-sms>';

    it('renders element', async () => {
        const page = await newE2EPage();
        await page.setContent(html);

        const component = await page.find('mi-share-sms');
        expect(component).toHaveClass('hydrated');
    });

    it('populates the country code input field', async () => {
        const page = await newE2EPage();
        await page.setContent('<mi-share-sms country-code="45"></mi-share-sms>');

        const inputElement = await page.find('.country-code');
        const inputElementValue = await inputElement.getProperty('value');
        expect(inputElementValue).toBe('45');
    });
});
