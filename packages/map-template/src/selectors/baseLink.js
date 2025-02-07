import { selector } from 'recoil';
import gmApiKeyState from '../atoms/gmApiKeyState';
import mapboxAccessTokenState from '../atoms/mapboxAccessTokenState';
import apiKeyState from '../atoms/apiKeyState';
import primaryColorState from '../atoms/primaryColorState';
import languageState from '../atoms/languageState';
import searchAllVenuesState from '../atoms/searchAllVenues';
import searchExternalLocationsState from '../atoms/searchExternalLocationsState';
import logoState from '../atoms/logoState';

/**
 * The baseLink selector is responsible for creating the base URL that can be used to share a link to the Map Template.
 * The URL will contain relevant query parameters that are used to configure the Map Template.
 */
const baseLink = selector({
    key: 'baseLink',
    get: ({ get }) => {

        const gmApiKey = get(gmApiKeyState);
        const mapboxAccessToken = get(mapboxAccessTokenState);
        const apiKey = get(apiKeyState);
        const primaryColor = get(primaryColorState);
        const language = get(languageState);
        const searchAllVenues = get(searchAllVenuesState);
        const searchExternalLocations = get(searchExternalLocationsState);
        const logo = get(logoState);

        // Get the last character of the pathname
        // Create the target URL when the user opens the QR code dialog
        // Replace the '/' at the end of the line
        const targetUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');

        // The interface for the existing URL search params
        const currentParams = new URLSearchParams(window.location.search);

        // The interface for the new URL search params
        const newParams = new URLSearchParams();

        /**
         * Handle the presence of relevant props
         * and append them to the newParams interface.
         */
        [['gmApiKey', gmApiKey],
        ['mapboxAccessToken', mapboxAccessToken],
        ['apiKey', apiKey],
        ['primaryColor', primaryColor],
        ['language', language],
        ['searchAllVenues', searchAllVenues],
        ['searchExternalLocations', searchExternalLocations],
        ['logo', logo]]
            .forEach(([queryParam, stateValue]) => {
                if (currentParams.has(queryParam)) {
                    const queryParameter = currentParams.get(queryParam);
                    newParams.append(queryParam, queryParameter);
                } else if (stateValue) {
                    if (stateValue === primaryColor) {
                        newParams.append(queryParam, primaryColor.replace('#', ''));
                    } else {
                        newParams.append(queryParam, stateValue);
                    }
                }
            });

        return `${targetUrl}?${newParams.toString()}`;
    }
});

export default baseLink;
