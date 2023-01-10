import { newSpecPage } from '@stencil/core/testing';
import { ListItemLocation } from './list-item-location';
import { h } from '@stencil/core';

describe('mi-list-item-location', () => {
    const locationItem = {
        properties: {
            name: 'Cabinet Room',
            categories: ['West Wing', 'East Wing'],
            floorName: 'G',
            building: 'The White House',
            type: 'Meetingroom',
            imageURL: 'https://cms.mapsindoors.com/icons/universities/meeting-room.png',
            geodesicDistance: 0
        }
    };

    it('builds', () => {
        expect(new ListItemLocation()).toBeTruthy();
    });

    it('should render distance JSX template', async (): Promise<void> => {
        const page = await newSpecPage({
            components: [ListItemLocation],
            template: () => (
                <mi-list-item-location unit="imperial" location={locationItem}></mi-list-item-location>
            ),
            supportsShadowDom: false
        });
        expect(page.body.getElementsByClassName('distance')[0]).toBeTruthy();
    });


    describe('Converting distance to readable imperial units', () => {
        const unit = 'imperial';

        it('should return 0 meters as a string in feet', async (): Promise<void> => {
            locationItem.properties.geodesicDistance = 0;
            const page = await newSpecPage({
                components: [ListItemLocation],
                template: () => (
                    <mi-list-item-location unit={unit} location={locationItem}></mi-list-item-location>
                ),
                supportsShadowDom: false
            });

            const distanceDivElement: HTMLDivElement = page.body.getElementsByClassName('distance')[0] as HTMLDivElement;
            expect(distanceDivElement.innerHTML).toEqual('0 ft' as string);
        });

        it('should calculate and return 1609.344 meters as a string in miles', async (): Promise<void> => {
            locationItem.properties.geodesicDistance = 1609.344;
            const page = await newSpecPage({
                components: [ListItemLocation],
                template: () => (
                    <mi-list-item-location unit={unit} location={locationItem}></mi-list-item-location>
                ),
                supportsShadowDom: false
            });

            const distanceDivElement: HTMLDivElement = page.body.getElementsByClassName('distance')[0] as HTMLDivElement;
            expect(distanceDivElement.innerHTML).toEqual('1 mi' as string);
        });
    });


    describe('Converting distance to readable metric units', () => {
        const unit = 'metric';

        it('should return 0 meters as a string in meters', async (): Promise<void> => {
            locationItem.properties.geodesicDistance = 0;
            const page = await newSpecPage({
                components: [ListItemLocation],
                template: () => (
                    <mi-list-item-location unit={unit} location={locationItem}></mi-list-item-location>
                ),
                supportsShadowDom: false
            });

            const distanceDivElement: HTMLDivElement = page.body.getElementsByClassName('distance')[0] as HTMLDivElement;
            expect(distanceDivElement.innerHTML).toEqual('0 m' as string);
        });

        it('should return 1200 meters as a string in kilometers', async (): Promise<void> => {
            locationItem.properties.geodesicDistance = 1200;
            const page = await newSpecPage({
                components: [ListItemLocation],
                template: () => (
                    <mi-list-item-location unit={unit} location={locationItem}></mi-list-item-location>
                ),
                supportsShadowDom: false
            });

            const distanceDivElement: HTMLDivElement = page.body.getElementsByClassName('distance')[0] as HTMLDivElement;
            expect(distanceDivElement.innerHTML).toEqual('1.2 km' as string);
        });
    });


});
