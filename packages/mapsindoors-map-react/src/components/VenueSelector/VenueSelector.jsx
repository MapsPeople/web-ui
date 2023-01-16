import { useState } from 'react';
import './VenueSelector.scss';
import { ReactComponent as BuildingLogo } from './../../assets/building.svg';
import Venue from './Venue/Venue';

/**
 *
 * @param {object} props
 * @param {array} props.venues
 * @returns
 */
function VenueSelector({ venues }) {
    const [active, setActive] = useState(false);

    const setVenue = () => {
        // TODO: Set the venue
    }

    return <>
        <button className="venue-selector__button" onClick={() => setActive(current => !current)} aria-label="Venues">
            <BuildingLogo />
        </button>
        {active && <div className="venue-selector__list">
            {venues.map(venue => (<Venue key={venue.id} venue={venue} onVenueSelected={() => setVenue(venue)} />))}
        </div>}
    </>
}

export default VenueSelector;
