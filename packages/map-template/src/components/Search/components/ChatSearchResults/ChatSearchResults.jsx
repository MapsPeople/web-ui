import './ChatSearchResults.scss';
import PropTypes from 'prop-types';
import ListItemLocation from '../../../WebComponentWrappers/ListItemLocation/ListItemLocation';

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
const ChatSearchResults = ({
    locations,
    locationHandlerRef,
    hoveredLocation
}) => {
    // Don't render if no locations
    if (!locations || locations.length === 0) {
        return null;
    }

    return (
        <div className="chat-search-results">
            <div className="chat-search-results__locations">
                {locations.map(location =>
                    <ListItemLocation
                        key={location.id}
                        location={location}
                        locationClicked={() => locationHandlerRef.current?.onLocationClicked(location)}
                        isHovered={location?.id === hoveredLocation?.id}
                    />
                )}
            </div>
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
