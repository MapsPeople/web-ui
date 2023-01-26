import { useContext, useEffect, useState, useRef } from 'react';
import './LocationDetails.scss';
import { ReactComponent as CloseIcon } from '../../../assets/close.svg';
import { MapsIndoorsContext } from '../../../MapsIndoorsContext';

function LocationDetails({ location, onClose }) {

    const locationInfoElement = useRef(null);

    // Holds the MapsIndoors DisplayRule for the location
    const [locationDisplayRyle, setLocationDisplayRule] = useState(null);

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

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
                {location.properties.description && <div className="location-details__description">
                    <h4>Description</h4>
                    <p>
                        {location.properties.description}
                    </p>
                </div>}
            </>}
    </div>
}

export default LocationDetails;
