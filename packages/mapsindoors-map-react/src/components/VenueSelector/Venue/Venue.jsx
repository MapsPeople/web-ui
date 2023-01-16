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
    return <button className={`venue ${!venue.image ? 'venue--no-image' : ''}`} onClick={() => onVenueSelected()} style={ venue.image ? {backgroundImage: `url('${venue.image}')`} : {}}>
        <div>{venue.venueInfo.name}</div>
        {isCurrent && <div className="venue__current">Current</div>}
    </button>
}

export default Venue;
