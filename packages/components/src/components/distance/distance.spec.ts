import { newSpecPage } from '@stencil/core/testing';
import { Distance } from './distance';

describe('mi-distance', () => {
    const distanceComponent = new Distance();


    it('builds', () => {
        expect(new Distance()).toBeTruthy();
    });

    it('should render <mi-distance>', async () => {
        const page = await newSpecPage({
            components: [Distance],
            html: '<mi-distance></mi-distance>',
        });
        expect(page.root).toEqualHtml(`
        <mi-distance>
            <mock:shadow-root></mock:shadow-root>
        </mi-distance>
      `);
    });


    // Metric tests ----------

    it('should format 1200 meters to "1.2 km"', () => {
        expect(distanceComponent.getMetricDisplayString(1200)).toBe('1.2 km');
    });

    it('should format 1000 meters to "1.0 km"', () => {
        expect(distanceComponent.getMetricDisplayString(1000)).toBe('1.0 km');
    });

    it('should format 999 meters to "999 m"', () => {
        expect(distanceComponent.getMetricDisplayString(999)).toBe('999 m');
    });

    it('should format 500 meters to "500 m"', () => {
        expect(distanceComponent.getMetricDisplayString(500)).toBe('500 m');
    });

    it('should format 0.5 meters to "1 m"', () => {
        expect(distanceComponent.getMetricDisplayString(0.5)).toBe('1 m');
    });

    it('should format 0 meters to "1 m"', () => {
        expect(distanceComponent.getMetricDisplayString(0)).toBe('1 m');
    });


    // Imperial tests ----------

    it('should format 2000 meters to "1.2 mi"', () => {
        expect(distanceComponent.getImperialDisplayString(2000)).toBe('1.2 mi');
    });

    it('should format 1616 meters to "1.0 mi"', () => {
        expect(distanceComponent.getImperialDisplayString(1616)).toBe('1.0 mi');
    });

    it('should format 1520 meters to "4987 ft"', () => {
        expect(distanceComponent.getImperialDisplayString(1520)).toBe('4987 ft');
    });

    it('should format 0.1524 meters to "1 ft"', () => {
        expect(distanceComponent.getImperialDisplayString(0.1524)).toBe('1 ft');
    });

    it('should format 0 meters to "1 ft"', () => {
        expect(distanceComponent.getImperialDisplayString(0)).toBe('1 ft');
    });
});
