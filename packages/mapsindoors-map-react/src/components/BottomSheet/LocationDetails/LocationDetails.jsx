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
        <mi-list-item-location ref={locationInfoElement} />
        {location.properties.imageURL && <img alt="" src={location.properties.imageURL} className="location-details__image" />}
    </div>
}

export default LocationDetails;
