import { useEffect, useRef } from 'react';
import './LocationDetails.scss';

function LocationDetails({ location }) {

    const locationInfoElement = useRef(null);

    useEffect(() => {
        if (location) {
            locationInfoElement.current.location = location;
        }
    }, [location]);

    return <div className="location-details">
            <div className="location-details__info location-info">
                <div className="location-info__icon">
                    [i] {/* FIXME: Location icon from Display Rule */}
                </div>
                <div className="location-info__content">
                    {location?.properties.name}<br />
                    <mi-location-info ref={locationInfoElement} />
                </div>
            </div>
            {location.properties.imageURL && <img alt="" src={location.properties.imageURL} className="location-details__image" />}
    </div>
}

export default LocationDetails;
