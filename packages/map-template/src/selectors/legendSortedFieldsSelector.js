import { selector } from 'recoil';
import kioskLocationState from '../atoms/kioskLocationState.js';

/**
 * Selector to get the sorted fields based on the kioskLocationState.
 */
const legendSortedFieldsSelector = selector({
    key: 'legendFields',
    get: ({ get }) => {
        const kioskLocation = get(kioskLocationState);

        if (!kioskLocation?.properties.fields) return;

        const legendFields = [];

        for (const customPropertyKey of Object.keys(kioskLocation.properties.fields)) {
            const index = parseInt(customPropertyKey.charAt(0));

            // Skip field if first character isn't a number.
            if (!Number.isInteger(index)) continue;

            const existingEntry = legendFields.find(i => i.index === index);
            const isHeadingEntry = customPropertyKey.toLowerCase().includes('legendheading');
            const isContentEntry = customPropertyKey.toLowerCase().includes('legendcontent');

            if (!existingEntry) {
                // Create new legend field
                const newEntry = {
                    index: index,
                    heading: isHeadingEntry ? kioskLocation.properties.fields[customPropertyKey].value : null,
                    content: isContentEntry ? kioskLocation.properties.fields[customPropertyKey].value : null
                };
                legendFields.push(newEntry);
            } else {
                // Update existing legend field
                if (isHeadingEntry) {
                    existingEntry.heading = kioskLocation.properties.fields[customPropertyKey].value;
                } else if (isContentEntry) {
                    existingEntry.content = kioskLocation.properties.fields[customPropertyKey].value;
                }
            }
        }

        const sortedFields = legendFields.sort((a, b) => a.index - b.index);
        return sortedFields;
    }
});

export default legendSortedFieldsSelector;
