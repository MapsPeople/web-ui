import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import './VenueSelector.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import venuesInSolutionState from '../../atoms/venuesInSolutionState';
import { ReactComponent as BuildingIcon } from '../../assets/building.svg';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import Venue from './Venue/Venue';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import isLocationClickedState from '../../atoms/isLocationClickedState';
import venueWasSelectedState from '../../atoms/venueWasSelectedState';
import PropTypes from 'prop-types';

VenueSelector.propTypes = {
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    active: PropTypes.bool
};

/**
 * Show a list of Venues. The user can click on a Venue to select it.
 *
 * @param {object} props
 * @param {function} props.onOpen - Callback to execute when the Venue Selector is opened.
 * @param {function} props.onClose - Callback to execute when the Venue Selector is closed.
 * @param {boolean} props.active - Whether the Venue Selector is currently active/visible.
 * @returns
 */
function VenueSelector({ onOpen, onClose, active }) {
    const { t } = useTranslation();

    const venueSelectorContentRef = useRef(null);
    const venuesInSolution = useRecoilValue(venuesInSolutionState);
    const [, setVenueWasSelected] = useRecoilState(venueWasSelectedState);

    const [currentVenueName, setCurrentVenueName] = useRecoilState(currentVenueNameState);

    const [, setIsLocationClicked] = useRecoilState(isLocationClickedState);

    const portalTarget = document.querySelector('.venue-selector-portal');

    /**
     * When a Venue is selected, close the list of Venues and do the callback.
     *
     * @param {object} venue
     */
    const selectVenue = venue => {
        setVenueWasSelected(true);
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

    return (
        <>
            {/* Portal the BuildingIcon button to the map controls container. Only rendered when the venue selector content is not visible */}
            {!active && portalTarget && createPortal(
                <button className="venue-selector__button" onClick={() => onOpen()} aria-label={t('Venues')}>
                    <BuildingIcon />
                </button>,
                portalTarget
            )}
            <CSSTransition
                in={active}
                nodeRef={venueSelectorContentRef}
                timeout={400}
                classNames="venue-selector__content"
                unmountOnExit
            >
                {/* Render the venue selector content */}
                <div className="venue-selector__content" ref={venueSelectorContentRef}>
                    <div className="venue-selector__header">
                        <h1>{t('Select venue')}</h1>
                        {/* Close button rendered within the venue selector header */}
                        <button className="venue-selector__button" onClick={() => onClose()} aria-label={t('Close')}>
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="venue-selector__list">
                        {venuesInSolution.map(venue => (
                            <Venue
                                key={venue.id}
                                isCurrent={currentVenueName?.toLowerCase() === venue.name.toLowerCase()}
                                venue={venue}
                                onVenueClicked={() => onVenueSelected(venue)}
                            />
                        ))}
                    </div>
                </div>
            </CSSTransition>
        </>
    );
}

export default VenueSelector;
