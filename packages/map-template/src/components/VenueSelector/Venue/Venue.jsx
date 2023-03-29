import { useEffect, useState } from 'react';
import './Venue.scss';

/**
 * Show a button containing Venue information.
 *
 * @param {object} props
 * @param {object} venue - The Venue to show.
 * @param {function} onVenueClicked - Callback to execute when Venue is clicked.
 * @returns
 */
function Venue({ venue, isCurrent, onVenueClicked }) {

    const [style, setStyle] = useState({});

    useEffect(() => {
        const styleObject = {};

        if (venue.image) {
            styleObject.backgroundImage = `url('${venue.image}')`;
        }

        setStyle(styleObject);
    }, [venue]);

    return <button className="venue" onClick={() => onVenueClicked()}>
        <div className="venue__image" style={style}></div>
        <div className="venue__content">
            <div>{venue.venueInfo.name}</div>
            {isCurrent && <div className="venue__current">Current</div>}
        </div>
    </button>
}

export default Venue;
