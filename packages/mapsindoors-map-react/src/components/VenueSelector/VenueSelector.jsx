import { useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
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
 * @param {number} props.width - The width of the element the Venue Selector is shown within
 * @returns
 */
function VenueSelector({ venues, currentVenueName, onVenueSelected, width }) {
    const [active, setActive] = useState(false);
    const venueSelectorContentRef = useRef(null);

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
        <CSSTransition unmountOnExit in={active} nodeRef={venueSelectorContentRef} timeout={400} classNames="venue-selector__list">
            <div className="venue-selector__list" ref={venueSelectorContentRef}>
                {venues.map(venue => (<Venue width={width} key={venue.id} isCurrent={currentVenueName === venue.name} venue={venue} onVenueSelected={() => selectVenue(venue)} />))}
            </div>
        </CSSTransition>
    </>
}

export default VenueSelector;
