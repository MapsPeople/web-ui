import React, { useContext, useEffect, useState, useRef } from 'react';
import './LocationDetails.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as PinIcon } from '../../assets/pin.svg';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { useIsVerticalOverflow } from '../../hooks/useIsVerticalOverflow';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import { snapPoints } from '../BottomSheet/Sheet/Sheet';

/**
 * Shows details for a MapsIndoors Location.
 *
 * @param {object} props
 * @param {object} props.location - The Location to show details for.
 * @param {function} props.onClose - Callback that fires when Location Details are closed by the user.
 * @param {function} props.onStartWayfinding - Callback that fires when user clicks the Start Wayfinding button.
 * @param {function} props.onSetSize - Callback that is fired when the toggle full description button is clicked and the Sheet size changes.
 * @param {function} props.snapPointSwiped - Changes value when user has swiped a Bottom sheet to a new snap point.
 */
function LocationDetails({ location, onClose, onStartWayfinding, onSetSize, snapPointSwiped }) {

    const locationInfoElement = useRef(null);
    const locationDetailsContainer = useRef(null);
    const locationDetailsElement = useRef(null);

    const [showFullDescription, setShowFullDescription] = useState(false);
    const [descriptionHasContentAbove, setDescriptionHasContentAbove] = useState(false);
    const [descriptionHasContentBelow, setDescriptionHasContentBelow] = useState(false);

    // Holds the MapsIndoors DisplayRule for the location
    const [locationDisplayRule, setLocationDisplayRule] = useState(null);

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    // Check if the content of the Location details is overflowing
    const [isOverflowing, initialOverflow] = useIsVerticalOverflow(location, locationDetailsElement);

    const scrollableContentSwipePrevent = usePreventSwipe();

    useEffect(() => {
        // Reset state
        setShowFullDescription(false);
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
        setLocationDisplayRule(null);

        if (location) {
            locationInfoElement.current.location = location;
            setLocationDisplayRule(mapsIndoorsInstance.getDisplayRule(location));
        }
    }, [location, mapsIndoorsInstance]);

    /*
     * When user swipes the bottom sheet to a new snap point.
     */
    useEffect(() => {
        if (snapPointSwiped === undefined) return;

        // If swiping to max height, expand location details.
        // If swiping to smaller height, collapse location details.
        setShowFullDescription(snapPointSwiped === snapPoints.MAX);
        if (snapPointSwiped === snapPoints.MAX) {
            expandLocationDescription();
        } else {
            collapseLocationDescription();
        }
    }, [snapPointSwiped]);

    /**
     * Toggle the description.
     */
    function toggleDescription() {
        if (showFullDescription === false) {
            onSetSize(snapPoints.MAX);
            expandLocationDescription();
        } else {
            onSetSize(snapPoints.FIT);
            collapseLocationDescription();
        }
    }

    /**
     * Expand the location description to be fully shown.
     */
    function expandLocationDescription() {
        requestAnimationFrame(() => { // Necessary to preserve transition
            setShowFullDescription(true);
            setScrollIndicators();
        });
    }

    /**
     * Collapse the location description to be truncated.
     */
    function collapseLocationDescription() {
        setShowFullDescription(false);
        unsetScrollIndicators();
    }

    /**
     * Scroll indicators adds a gradient to either the top or the bottom,
     * indicating if there is more content above or below what is visible.
     */
    function setScrollIndicators() {
        requestAnimationFrame(() => {
            setDescriptionHasContentAbove(locationDetailsContainer.current.scrollTop > 0);
            setDescriptionHasContentBelow(locationDetailsContainer.current.scrollTop < (locationDetailsContainer.current.scrollHeight - locationDetailsContainer.current.offsetHeight - 1));
        });
    }

    /**
     * Remove scroll indicators.
     */
    function unsetScrollIndicators() {
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
    }

    return <div className={`location-details ${descriptionHasContentAbove ? 'location-details--content-above' : ''} ${descriptionHasContentBelow ? 'location-details--content-below' : ''}`}>
        {location && <>
            <div className="location-info">
                <div className="location-info__icon">
                    {locationDisplayRule && <img alt="" src={locationDisplayRule.icon} />}
                </div>
                <div className="location-info__content">
                    {location.properties.name}<br />
                    <mi-location-info ref={locationInfoElement} />
                </div>
                <button className="location-info__close" onClick={() => onClose()}>
                    <CloseIcon />
                </button>
            </div>

            <div ref={locationDetailsContainer} onScroll={e => setScrollIndicators(e)} className="location-details__details">
                {location.properties.imageURL && <img alt="" src={location.properties.imageURL} className="location-details__image" />}

                {Object.keys(location.properties.categories).length > 0 && <p className="location-details__categories">
                    {Object.values(location.properties.categories).map((category, index, array) => {
                        return <React.Fragment key={category}>{category}{index < array.length-1 && <>・</>}</React.Fragment>
                    })}
                </p>}

                {location.properties.description && <section {...scrollableContentSwipePrevent} className={`location-details__description prevent-scroll ${showFullDescription ? 'location-details__description--full' : ''}`}>
                    <div ref={locationDetailsElement}>
                        {location.properties.description}
                    </div>
                    {(isOverflowing || (initialOverflow && showFullDescription)) && (
                        <button onClick={() => toggleDescription()}>
                            {!showFullDescription ? 'Read full description' : 'Close' }
                        </button>
                    )}
                </section>}
            </div>

            <button onClick={() => onStartWayfinding()} className="location-details__wayfinding">
                <PinIcon />
                Start wayfinding
                {/* FIXME: Implement */}
            </button>
        </>}
    </div>
}

export default LocationDetails;