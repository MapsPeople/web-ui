import { useRecoilValue } from "recoil";
import kioskLocationState from "../atoms/kioskLocationState";
import { useIsDesktop } from "./useIsDesktop";

/**
 * React hook that can be used indicate if we are on a kiosk context.
 */
export const useIsKioskContext = () => {

    const kioskLocation = useRecoilValue(kioskLocationState);

    const isDesktop = useIsDesktop();

    if (!kioskLocation || (kioskLocation && !isDesktop)) {
        return false;
    } else {
        return true;
    }
};
