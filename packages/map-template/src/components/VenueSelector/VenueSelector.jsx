import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import './VenueSelector.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import venuesState from '../../atoms/venuesState';
import { ReactComponent as BuildingIcon } from '../../assets/building.svg';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import Venue from './Venue/Venue';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import isLocationClickedState from '../../atoms/isLocationClickedState';

/**
 * Show a list of Venues. The user can click on a Venue to select it.
 *
 * @param {object} props
 * @param {function} props.onOpen - Callback to execute when the Venue Selector is opened.
 * @returns
 */
function VenueSelector({ onOpen, onClose, active }) {
    const { t } = useTranslation();

    const venueSelectorContentRef = useRef(null);
    const venues = useRecoilValue(venuesState);

    const [currentVenueName, setCurrentVenueName] = useRecoilState(currentVenueNameState);
    const [, setIsLocationClicked] = useRecoilState(isLocationClickedState);

    /**
     * When a Venue is selected, close the list of Venues and do the callback.
     *
     * @param {object} venue
     */
    const selectVenue = venue => {
        setCurrentVenueName(venue.name);
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

    /**
     * Handle venue selection.
     *
     * @param {object} venue
     */
    function onVenueSelected(venue) {
        selectVenue(venue);
        setIsLocationClicked(false);
    }

    return <>
        <button className={`venue-selector__button ${active ? 'venue-selector__button--open' : ''}`} onClick={() => toggle()} aria-label="Venues">
            {active ? <CloseIcon /> : <BuildingIcon />}
        </button>
        <CSSTransition unmountOnExit in={active} nodeRef={venueSelectorContentRef} timeout={400} classNames="venue-selector__content">
            <div className="venue-selector__content" ref={venueSelectorContentRef}>
                <h1>{t('Select venue')}</h1>
                <div className="venue-selector__list">
                    {venues.map(venue => (<Venue key={venue.id} isCurrent={currentVenueName === venue.name} venue={venue} onVenueClicked={() => onVenueSelected(venue)} />))}
                </div>
            </div>
        </CSSTransition>
    </>
}

export default VenueSelector;
