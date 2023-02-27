import React, { useContext, useEffect, useState, useRef } from 'react';
import './LocationDetails.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as PinIcon } from '../../assets/pin.svg';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { useIsVerticalOverflow } from '../../hooks/useIsVerticalOverflow';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import { snapPoints } from '../BottomSheet/Sheet/Sheet';

function LocationDetails({ location, onClose, onStartWayfinding, onSetSize }) {

    const locationInfoElement = useRef(null);
    const locationDetailsElement = useRef(null);

    const [showFullDescription, setShowFullDescription] = useState(false);

    // Holds the MapsIndoors DisplayRule for the location
    const [locationDisplayRyle, setLocationDisplayRule] = useState(null);

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    // Check if the content of the Location details is overflowing
    const isOverflowing = useIsVerticalOverflow(location, locationDetailsElement);

    const scrollableContentSwipePrevent = usePreventSwipe();

    useEffect(() => {
        if (location) {
            locationInfoElement.current.location = location;
            setLocationDisplayRule(mapsIndoorsInstance.getDisplayRule(location));
        }
    }, [location, mapsIndoorsInstance]);

    /**
     * Proof of concept of a way to programatically change sheet size.
     * FIXME: Replace this with actual use case for changing sheet height programatically.
     * @param {number} snapPoint
     */
    function changeSize(snapPoint) {
        onSetSize(snapPoint);
    }

    return <div className="location-details">
        {location && <>
            <div className="location-info">
                <div className="location-info__icon">
                    {locationDisplayRyle && <img alt="" src={locationDisplayRyle.icon} />}
                </div>
                <div className="location-info__content">
                    {location.properties.name}<br />
                    <mi-location-info ref={locationInfoElement} />
                </div>
                <button className="location-info__close" onClick={() => onClose()}>
                    <CloseIcon />
                </button>
            </div>

            <div className="location-details__details">
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
                    <button onClick={() => changeSize(snapPoints.MAX)}>Set to full</button> | <button onClick={() => changeSize(snapPoints.FIT)}>Set to fit</button> | <button onClick={() => changeSize(snapPoints.MIN)}>Set to min</button>
                    {(isOverflowing || showFullDescription) && <button onClick={() => setShowFullDescription(!showFullDescription)}>{!showFullDescription ? 'Read full description' : 'Close' }</button>}
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