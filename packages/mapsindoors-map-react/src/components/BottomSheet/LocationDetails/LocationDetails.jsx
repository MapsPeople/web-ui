import { useEffect, useRef } from 'react';
import './LocationDetails.scss';
import { ReactComponent as CloseIcon } from '../../../assets/close.svg';

function LocationDetails({ location, onClose }) {

    const locationInfoElement = useRef(null);

    useEffect(() => {
        if (location) {
            locationInfoElement.current.location = location;
        }
    }, [location]);

    return <div className="location-details">
            {location && <>
                <div className="location-details__info location-info">
                    <div className="location-info__icon">
                        [i] {/* FIXME: Location icon from Display Rule */}
                    </div>
                    <div className="location-info__content">
                        {location?.properties.name}<br />
                        <mi-location-info ref={locationInfoElement} />
                    </div>
                    <button className="location-info__close" onClick={() => onClose()}>
                        <CloseIcon />
                    </button>
                </div>
                {location.properties.imageURL && <img alt="" src={location.properties.imageURL} className="location-details__image" />}
            </>}
    </div>
}

export default LocationDetails;
