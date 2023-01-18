import { useEffect, useState } from 'react';
import './Venue.scss';

/**
 * Show a button containing Venue information.
 *
 * @param {object} props
 * @param {object} venue
 * @param {function} onVenueSelected
 * @param {number} width
 * @returns
 */
function Venue({ venue, isCurrent, onVenueSelected, width }) {

    const [style, setStyle] = useState({});

    useEffect(() => {
        // We set the width with a hard pixel value since setting it to 100% will make the background image shift due to the width transition on the parent element.
        const styleObject = {
            width: `calc(${width}px - 16px)`
        };

        if (venue.image) {
            styleObject.backgroundImage = `url('${venue.image}')`;
        }

        setStyle(styleObject);
    }, [venue, width]);

    return <button className={`venue ${!venue.image ? 'venue--no-image' : ''}`} onClick={() => onVenueSelected()} style={style}>
        <div className="venue__content">
            <div>{venue.venueInfo.name}</div>
            {isCurrent && <div className="venue__current">Current</div>}
        </div>
    </button>
}

export default Venue;
