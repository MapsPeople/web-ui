import './Venue.scss';

/**
 * Show a button containing Venue information.
 *
 * @param {object} props
 * @param {object} venue
 * @param {function} onVenueSelected
 * @returns
 */
function Venue({ venue, onVenueSelected }) {
    return <button className="venue" onClick={() => onVenueSelected()}>
        <div className="venue__name">{venue.venueInfo.name}</div>
    </button>
}

export default Venue;
