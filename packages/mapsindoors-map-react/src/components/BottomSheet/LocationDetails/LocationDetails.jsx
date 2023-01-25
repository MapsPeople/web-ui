import { useEffect, useRef } from 'react';

function LocationDetails({ location }) {

    const locationInfoElement = useRef(null);

    useEffect(() => {
        if (location) {
            locationInfoElement.current.location = location;
        }
    }, [location]);

    return <div className="location-details">
        <mi-list-item-location ref={locationInfoElement} />
    </div>
}

export default LocationDetails;
