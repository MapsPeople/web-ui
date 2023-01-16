import './Venue.scss';

/**
 * Show a button containing Venue information.
 *
 * @param {object} props
 * @param {object} venue
 * @param {function} onVenueSelected
 * @returns
 */
function Venue({ venue, isCurrent, onVenueSelected }) {
    return <button className="venue" onClick={() => onVenueSelected()}>
        <div>{venue.venueInfo.name}</div>
        {isCurrent && <div className="venue__current">Current</div>}
    </button>
}

export default Venue;
