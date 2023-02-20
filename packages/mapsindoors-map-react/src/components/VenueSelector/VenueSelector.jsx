import { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import './VenueSelector.scss';
import { ReactComponent as BuildingIcon } from '../../assets/building.svg';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import Venue from './Venue/Venue';

/**
 * Show a list of Venues. The user can click on a Venue to select it.
 *
 * @param {object} props
 * @param {array} props.venues - Venues to present.
 * @param {string} props.currentVenueName - The name of the current venue.
 * @param {function} props.onVenueSelected - Callback to execute when a Venue is selected.
 * @param {function} props.onOpen - Callback to execute when the Venue Selector is opened.
 * @param {function} props.onClose - Callback to execute when the Venue Selector is closed.
 * @returns
 */
function VenueSelector({ venues, currentVenueName, onVenueSelected, onOpen, onClose, active }) {
    const venueSelectorContentRef = useRef(null);

    /**
     * When a Venue is selected, close the list of Venues and do the callback.
     *
     * @param {object} venue
     */
    const selectVenue = venue => {
        onVenueSelected(venue);
        toggle();
    };

    /**
     * Toggle the venue selector.
     */
    const toggle = () => {
        if (!active) {
            onOpen();
        } else {
            onClose();
        }
    };

    return <>
        <button className={`venue-selector__button ${active ? 'venue-selector__button--open' : '' }`} onClick={() => toggle()} aria-label="Venues">
            {active ? <CloseIcon /> : <BuildingIcon />}
        </button>
        <CSSTransition unmountOnExit in={active} nodeRef={venueSelectorContentRef} timeout={400} classNames="venue-selector__content">
            <div className="venue-selector__content" ref={venueSelectorContentRef}>
                <h1>Select venue</h1>
                <div className="venue-selector__list">
                    {venues.map(venue => (<Venue key={venue.id} isCurrent={currentVenueName === venue.name} venue={venue} onVenueClicked={() => selectVenue(venue)} />))}
                </div>
            </div>
        </CSSTransition>
    </>
}

export default VenueSelector;
