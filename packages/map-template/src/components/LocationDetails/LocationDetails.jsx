import React, { useContext, useEffect, useState, useRef } from 'react';
import './LocationDetails.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as PinIcon } from '../../assets/pin.svg';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { useIsVerticalOverflow } from '../../hooks/useIsVerticalOverflow';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import { snapPoints } from '../../constants/snapPoints';

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
function LocationDetails({ location, onBack, onStartWayfinding, onSetSize, snapPointSwiped }) {

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

    /**
     * Communicate size change to parent component.
     * @param {number} size
     */
    function setSize(size) {
        if (typeof onSetSize === 'function') {
            onSetSize(size);
        }
    }

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
    }, [snapPointSwiped]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Toggle the description.
     */
    function toggleDescription() {
        if (showFullDescription === false) {
            setSize(snapPoints.MAX);
            expandLocationDescription();
        } else {
            setSize(snapPoints.FIT);
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

    /*
     * Start wayfinding, making some cleanup first.
     */
    function startWayfinding() {
        setShowFullDescription(false);
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
        setSize(snapPoints.FIT);

        onStartWayfinding();
    }

    function back() {
        setShowFullDescription(false);
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
        setSize(snapPoints.FIT);

        onBack();
    }

    return <div className={`location-details ${descriptionHasContentAbove ? 'location-details--content-above' : ''} ${descriptionHasContentBelow ? 'location-details--content-below' : ''}`}>
        {location && <>
            <div className="location-info">
                <div className="location-info__icon">
                    {locationDisplayRule && <img alt="" src={locationDisplayRule.icon} />}
                </div>
                <div className="location-info__content">
                    <div className='location-info__name'>
                        {location.properties.name}
                    </div>
                    <mi-location-info ref={locationInfoElement} />
                </div>
                <button className="location-info__close" onClick={() => back()}>
                    <CloseIcon />
                </button>
            </div>

            <div ref={locationDetailsContainer} onScroll={e => setScrollIndicators(e)} className="location-details__details">
                {/* Location image */}
                {location.properties.imageURL && <img alt="" src={location.properties.imageURL} className="location-details__image" />}

                {/* Location categories */}
                {Object.keys(location.properties.categories).length > 0 && <p className="location-details__categories">
                    {Object.values(location.properties.categories).map((category, index, array) => {
                        return <React.Fragment key={category}>{category}{index < array.length - 1 && <>・</>}</React.Fragment>
                    })}
                </p>}

                {/* Location description */}
                {location.properties.description && !showFullDescription && <section className="location-details__description">
                    <div ref={locationDetailsElement}>
                        {location.properties.description}
                    </div>
                    {(isOverflowing || initialOverflow) && <button onClick={() => toggleDescription()}>
                        Read full description
                    </button>}
                </section>}
                {location.properties.description && showFullDescription && <section className="location-details__description location-details__description--full prevent-scroll" {...scrollableContentSwipePrevent}>
                    <div>
                        {location.properties.description}
                    </div>
                    {initialOverflow && <button onClick={() => toggleDescription()}>
                        Close
                    </button>}
                </section>}
            </div>

            <button onClick={() => startWayfinding()} className="location-details__wayfinding">
                <PinIcon />
                Start wayfinding
            </button>
        </>}
    </div>
}

export default LocationDetails;