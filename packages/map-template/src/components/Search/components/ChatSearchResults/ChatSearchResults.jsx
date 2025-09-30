import { useState } from 'react';
import './ChatSearchResults.scss';
import PropTypes from 'prop-types';
import ListItemLocation from '../../../WebComponentWrappers/ListItemLocation/ListItemLocation';

// Default number of locations to show before "show more" button
const DEFAULT_LOCATIONS_TO_SHOW = 3;

/**
 * ChatSearchResults component handles the display of location results within chat messages.
 * It provides the same functionality as SearchResults but is designed to be embedded
 * within chat message responses from the AI assistant.
 *
 * @param {Object} props
 * @param {Array} props.locations - Array of location objects to display
 * @param {Object} props.locationHandlerRef - Reference to location handler component for map interactions
 * @param {Object} props.hoveredLocation - Currently hovered location for highlighting
 */
const ChatSearchResults = ({ locations, locationHandlerRef, hoveredLocation }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Don't render if no locations
    if (!locations || locations.length === 0) {
        return null;
    }

    const totalLocations = locations.length;
    const shouldShowToggle = totalLocations > DEFAULT_LOCATIONS_TO_SHOW;
    const locationsToShow = isExpanded ? locations : locations.slice(0, DEFAULT_LOCATIONS_TO_SHOW);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="chat-search-results">
            <div className="chat-search-results__locations">
                {locationsToShow.map(location =>
                    <ListItemLocation
                        key={location.id}
                        location={location}
                        locationClicked={() => locationHandlerRef.current?.onLocationClicked(location)}
                        isHovered={location?.id === hoveredLocation?.id}
                    />
                )}
            </div>

            {shouldShowToggle && (
                <button
                    className="chat-search-results__toggle-button"
                    onClick={handleToggle}
                    type="button">
                    {isExpanded
                        ? `Collapse all ${totalLocations} locations found`
                        : `View all ${totalLocations} locations found`
                    }
                </button>
            )}
        </div>
    );
};

ChatSearchResults.displayName = 'ChatSearchResults';

ChatSearchResults.propTypes = {
    locations: PropTypes.array.isRequired,
    locationHandlerRef: PropTypes.object.isRequired,
    hoveredLocation: PropTypes.object
};

export default ChatSearchResults;
