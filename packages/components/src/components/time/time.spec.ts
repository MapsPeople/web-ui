import { newSpecPage } from '@stencil/core/testing';
import { Time } from './time';

describe('mi-time', () => {
    const timeComponent = new Time();

    it('builds', () => {
        expect(new Time()).toBeTruthy();
    });

    it('should render <mi-time>', async () => {
        const page = await newSpecPage({
            components: [Time],
            html: '<mi-time></mi-time>',
        });
        expect(page.root).toEqualHtml(`
        <mi-time>
            <mock:shadow-root></mock:shadow-root>
        </mi-time>
      `);
    });

    it('should format 0 seconds to "1 min"', () => {
        expect(timeComponent.getDurationDisplayString(0)).toBe('1 min');
    });

    it('should format 1000 seconds to "16 min"', () => {
        expect(timeComponent.getDurationDisplayString(1000)).toBe('16 min');
    });

    it('should format 4000 seconds to "1 h 6 min"', () => {
        expect(timeComponent.getDurationDisplayString(4000)).toBe('1 h 6 min');
    });

    it('should format 91400 seconds to "1 d 1 h 23 min"', () => {
        expect(timeComponent.getDurationDisplayString(91400)).toBe('1 d 1 h 23 min');
    });
});
