import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';

/**
 * Drives the SDK to a target Location's Venue → Building → Floor and keeps them in sync.
 *
 * @param {object|null} targetLocation - MapsIndoors Location to centre the Venue/Building/Floor on, or null to disable.
 * @param {function} setCurrentVenueName - Venue setter from `useCurrentVenue`, used to keep the
 *   app's Venue state (venue selector, categories, search scope) in sync with the SDK.
 */
export const useSyncToLocationContext = (targetLocation, setCurrentVenueName) => {
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    useEffect(() => {
        if (!mapsIndoorsInstance || !targetLocation) return;

        const targetFloor = targetLocation.properties.floor;
        let isCancelled = false;
        let detachListeners = () => {};

        (async () => {
            const { VenuesService } = window.mapsindoors.services;

            const venues = await VenuesService.getVenues();
            if (isCancelled) return;
            const targetVenue = venues.find(venue =>
                venue.id === targetLocation.properties.venueId
                || venue.name === targetLocation.properties.venueId
                || venue.venueInfo?.name === targetLocation.properties.venue);
            if (!targetVenue) return;

            /**  
             * Keep the app's Venue state in sync (selector, categories, search scope). The direct 
             * setVenue below still runs because the SDK's own building_changed handler can otherwise
             * override the recoil-driven venue.
            */
            setCurrentVenueName(targetVenue.name);

            const buildings = await VenuesService.getBuildings(targetVenue.id);
            if (isCancelled) return;
            const targetBuilding = buildings.find(building =>
                building.id === targetLocation.properties.buildingId
                || building.buildingInfo?.name === targetLocation.properties.building);

            const isContextActive = () =>
                mapsIndoorsInstance.getVenue()?.id === targetVenue.id
                && (!targetBuilding || mapsIndoorsInstance.getBuilding()?.id === targetBuilding.id)
                && (targetFloor === undefined || mapsIndoorsInstance.getFloor() === targetFloor);

            const applyContext = () => {
                if (mapsIndoorsInstance.getVenue()?.id !== targetVenue.id) mapsIndoorsInstance.setVenue(targetVenue);
                if (targetBuilding && mapsIndoorsInstance.getBuilding()?.id !== targetBuilding.id) mapsIndoorsInstance.setBuilding(targetBuilding);
                if (targetFloor !== undefined && mapsIndoorsInstance.getFloor() !== targetFloor) mapsIndoorsInstance.setFloor(targetFloor);
            };

            const reassertUntilSettled = () => {
                if (isCancelled || isContextActive()) return detachListeners();
                applyContext();
            };

            detachListeners = () => {
                mapsIndoorsInstance.removeListener('building_changed', reassertUntilSettled);
                mapsIndoorsInstance.removeListener('floor_changed', reassertUntilSettled);
            };
            mapsIndoorsInstance.addListener('building_changed', reassertUntilSettled);
            mapsIndoorsInstance.addListener('floor_changed', reassertUntilSettled);
            applyContext();
        })().catch(error => {
            detachListeners();
            console.warn('Failed to sync map to location venue/building/floor', error);
        });

        return () => { isCancelled = true; detachListeners(); };
    }, [mapsIndoorsInstance, targetLocation, setCurrentVenueName]);
};

export default useSyncToLocationContext;
