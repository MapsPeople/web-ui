import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../atoms/mapsIndoorsInstanceState';
import kioskLocationState from '../atoms/kioskLocationState';
import getDesktopPaddingLeft from '../helpers/GetDesktopPaddingLeft';
import getDesktopPaddingBottom from '../helpers/GetDesktopPaddingBottom';
import getMobilePaddingBottom from '../helpers/GetMobilePaddingBottom';
import { useIsDesktop } from './useIsDesktop';

export function useDirectionsRouteViewportFit() {
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const kioskLocation = useRecoilValue(kioskLocationState);
    const isDesktop = useIsDesktop();

    return async (directionsResult) => {
        if (!mapsIndoorsInstance?.goTo || !directionsResult?.legs) return;

        const features = directionsResult.legs.flatMap(leg =>
            (leg.steps ?? []).filter(step => step.geometry).map(step => ({
                type: 'Feature',
                geometry: step.geometry,
                properties: {}
            }))
        );
        if (features.length === 0) return;

        const padding = Math.min(window.innerHeight, window.innerWidth) * 0.06;
        const [bottomPadding, leftPadding] = await Promise.all([
            isDesktop ? (kioskLocation ? getDesktopPaddingBottom() : padding) : getMobilePaddingBottom(),
            isDesktop ? (kioskLocation ? padding : getDesktopPaddingLeft()) : padding
        ]);

        mapsIndoorsInstance.goTo(
            { type: 'FeatureCollection', features },
            {
                maxZoom: 22,
                padding: { top: padding, bottom: bottomPadding, left: leftPadding, right: padding }
            }
        );
    };
}
