import { useContext, useEffect, useState, useRef } from 'react';
import './LocationDetails.scss';
import { ReactComponent as CloseIcon } from '../../../assets/close.svg';
import { MapsIndoorsContext } from '../../../MapsIndoorsContext';
import { useIsVerticalOverflow } from '../../../hooks/useIsVerticalOverflow';

function LocationDetails({ location, onClose }) {

    const locationInfoElement = useRef(null);
    const locationDetailsElement = useRef(null);

    const [showFullDescription, setShowFullDescription] = useState(false);

    // Holds the MapsIndoors DisplayRule for the location
    const [locationDisplayRyle, setLocationDisplayRule] = useState(null);

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    // Check if the content of the Location details is overflowing
    const isOverflowing = useIsVerticalOverflow(locationDetailsElement);

    useEffect(() => {
        if (location) {
            locationInfoElement.current.location = location;
            setLocationDisplayRule(mapsIndoorsInstance.getDisplayRule(location));
        }
    }, [location, mapsIndoorsInstance]);

    return <div className="location-details">
            {location && <>
                <div className="location-details__info location-info">
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
                {/* FIXME: Show categories */}
                {location.properties.imageURL && <img alt="" src={location.properties.imageURL} className="location-details__image" />}
                {location.properties.description && <section className={`location-details__description ${showFullDescription ? 'location-details__description--full' : ''}`}>
                    <h4>Description</h4>
                    <div ref={locationDetailsElement}>
                        {location.properties.description}
                    </div>
                    {(isOverflowing || showFullDescription) && <button onClick={() => setShowFullDescription(!showFullDescription)}>{!showFullDescription ? 'Read full description' : 'Close' }</button>}
                </section>}
            </>}
    </div>
}

export default LocationDetails;
