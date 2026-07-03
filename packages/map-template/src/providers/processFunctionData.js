/**
 * Normalize a `functionResponse` (`{ key, value }`) into the shape UI consumers need.
 *
 * @param {{key?: string, value?: any}} functionData - The raw functionResponse from the chat.
 * @returns {{searchResultIds: string[], directionsLocationIds: (object|null), distanceResults: (Array|null)}}
 */
export function processFunctionData(functionData) {
    const result = {
        searchResultIds: [],
        directionsLocationIds: null,
        distanceResults: null
    };

    if (!functionData) return result;

    switch (functionData?.key) {
        case 'single_location':
            result.searchResultIds = [functionData.value];
            break;

        case 'multiple_locations':
            result.searchResultIds = Array.isArray(functionData.value)
                ? functionData.value.filter(Boolean)
                : [];
            break;

        case 'directions': {
            const originLocationId = functionData.value?.originLocationId;
            const destinationLocationId = functionData.value?.destinationLocationId;
            if (originLocationId && destinationLocationId) {
                result.directionsLocationIds = {
                    originLocationId,
                    destinationLocationId,
                    ...(functionData.value?.avoidStairs && { avoidStairs: true })
                };
            }
            break;
        }

        case 'distances': {
            if (Array.isArray(functionData.value) && functionData.value.length) {
                result.distanceResults = functionData.value;
                result.searchResultIds = functionData.value
                    .map(d => d?.destinationId)
                    .filter(Boolean);
            }
            break;
        }

        default:
            break;
    }

    return result;
}
