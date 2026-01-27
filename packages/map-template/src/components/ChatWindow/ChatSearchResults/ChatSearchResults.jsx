import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import './ChatSearchResults.scss';
import PropTypes from 'prop-types';
import ListItemLocation from '../../WebComponentWrappers/ListItemLocation/ListItemLocation';
import currentLocationState from '../../../atoms/currentLocationState';
import mapsIndoorsInstanceState from '../../../atoms/mapsIndoorsInstanceState';
import isLocationClickedState from '../../../atoms/isLocationClickedState';
import currentVenueNameState from '../../../atoms/currentVenueNameState';
import { useIsDesktop } from '../../../hooks/useIsDesktop';

// Default number of locations to show before "show more" button
const DEFAULT_LOCATIONS_TO_SHOW = 3;

/**
 * ChatSearchResults component handles the display of location results within chat messages.
 * It provides the same functionality as SearchResults but is designed to be embedded
 * within chat message responses from the AI assistant.
 *
 * @param {Object} props
 * @param {Array} props.locations - Array of location objects to display
 */
const ChatSearchResults = ({ locations }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredLocationId, setHoveredLocationId] = useState(null);

    // Recoil state for location handling
    const [, setCurrentLocation] = useRecoilState(currentLocationState);
    const [, setIsLocationClicked] = useRecoilState(isLocationClickedState);
    const [currentVenueName, setCurrentVenueName] = useRecoilState(currentVenueNameState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const isDesktop = useIsDesktop();

    // Don't render if no locations
    if (!locations || locations.length === 0) {
        return null;
    }

    const totalLocations = locations.length;
    const shouldShowToggle = totalLocations > DEFAULT_LOCATIONS_TO_SHOW;
    const locationsToShow = isExpanded ? locations : locations.slice(0, DEFAULT_LOCATIONS_TO_SHOW);

    /**
     * Handle location click - navigate to location on map
     * Similar to LocationHandler pattern
     */
    const handleLocationClick = async (location) => {
        if (!mapsIndoorsInstance) return;

        setCurrentLocation(location);

        // Set the current venue to be the selected location venue
        if (location?.properties?.venueId?.toLowerCase() !== currentVenueName?.toLowerCase()) {
            setCurrentVenueName(location.properties.venueId);
            setIsLocationClicked(true);
        }

        const currentFloor = mapsIndoorsInstance.getFloor();
        const locationFloor = location.properties.floor;

        // Set the floor to the one that the location belongs to
        if (locationFloor !== currentFloor) {
            mapsIndoorsInstance.setFloor(locationFloor);
        }

        // Calculate padding and navigate to location
        const [bottomPadding, leftPadding] = await Promise.all([
            getBottomPadding(),
            getLeftPadding()
        ]);

        mapsIndoorsInstance.goTo(location, {
            maxZoom: 25,
            padding: { bottom: bottomPadding, left: leftPadding, top: 0, right: 0 }
        });
    };

    /**
     * Get bottom padding when selecting a location
     */
    const getBottomPadding = async () => {
        if (isDesktop) {
            return 0;
        } else {
            return 200;
        }
    };

    /**
     * Get left padding when selecting a location
     */
    const getLeftPadding = async () => 0;

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
                        locationClicked={() => handleLocationClick(location)}
                        isHovered={location?.id === hoveredLocationId}
                        onMouseEnter={() => setHoveredLocationId(location.id)}
                        onMouseLeave={() => setHoveredLocationId(null)}
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
    locations: PropTypes.array.isRequired
};

export default ChatSearchResults;
