import { newSpecPage } from '@stencil/core/testing';
import { Notification } from './notification';

describe('mi-notification', () => {
    it('builds', () => {
        expect(new Notification()).toBeTruthy();
    });

    it('should render host element with a "bottom-right" class', async () => {
        const page = await newSpecPage({
            components: [Notification],
            html: `<mi-notification position="bottom-right" duration="6"></mi-notification>`,
        });
        expect(page.root).toEqualHtml(`
            <mi-notification class="bottom-right" position="bottom-right" duration="6">
                <mock:shadow-root>
                </mock:shadow-root>
            </mi-notification>
        `);
    });
});
