import useMediaQuery from "./useMediaQuery";

/**
 * React hook that returns a boolean whether
 * the viewport size is a desktop size.
 */
export const useIsDesktop = () => {
    return useMediaQuery('(min-width: 992px)');
};
