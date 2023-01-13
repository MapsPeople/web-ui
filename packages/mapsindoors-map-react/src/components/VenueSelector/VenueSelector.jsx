import { useState } from 'react';
import './VenueSelector.scss';
import { ReactComponent as BuildingLogo } from './../../assets/building.svg';

function VenueSelector() {
    const [active, setActive] = useState(false);

    return <div className="venue-selector">
        <button className="venue-selector__button" onClick={() => setActive(current => !current)} aria-label="Venues">
            <BuildingLogo />
        </button>
        {active && <div className="venue-selector__list">
            Venues list...
        </div>}
    </div>
}

export default VenueSelector;
