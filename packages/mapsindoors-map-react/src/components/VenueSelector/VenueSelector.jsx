import { useState } from 'react';
import './VenueSelector.scss';
import { ReactComponent as BuildingIcon } from '../../assets/building.svg';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import Venue from './Venue/Venue';

/**
 *
 * @param {object} props
 * @param {array} props.venues
 * @param {string} props.currentVenueName
 * @param {function} props.onVenueSelected
 * @returns
 */
function VenueSelector({ venues, currentVenueName, onVenueSelected }) {
    const [active, setActive] = useState(false);

    /**
     * Close list of Venues and make callback.
     *
     * @param {object} venue
     */
    const selectVenue = venue => {
        setActive(false);
        onVenueSelected(venue);
    };

    return <>
        <button className="venue-selector__button" onClick={() => setActive(current => !current)} aria-label="Venues">
            {active ? <CloseIcon /> : <BuildingIcon />}
        </button>
        {active && <div className="venue-selector__list">
            {venues.map(venue => (<Venue key={venue.id} isCurrent={currentVenueName === venue.name} venue={venue} onVenueSelected={() => selectVenue(venue)} />))}
        </div>}
    </>
}

export default VenueSelector;
