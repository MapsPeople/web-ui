import './LocationDetails.css';
import PropTypes from 'prop-types';

LocationDetails.propTypes = {
    location: PropTypes.object
};

/**
 * Component to show details for a MapsIndoors Location.
 *
 * @param {object} props
 * @param {object} props.location - The MapsIndoors Location object.
 */
function LocationDetails({ location }) {
    return location && <div className="location-details">
            <h1>{location.properties.name}</h1>
        </div>;
}

export default LocationDetails;
