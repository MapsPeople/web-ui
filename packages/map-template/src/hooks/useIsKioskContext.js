import { useRecoilValue } from "recoil";
import kioskLocationState from "../atoms/kioskLocationState";
import useMediaQuery from "./useMediaQuery";

/**
 * React hook that can be used indicate if we are on a kiosk context.
 */
export const useIsKioskContext = () => {

    const kioskLocation = useRecoilValue(kioskLocationState);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    if (!kioskLocation || (kioskLocation && !isDesktop)) {
        return false;
    } else {
        return true;
    }
};
