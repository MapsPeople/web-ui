import React from "react";
import './LocationsList.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import ListItemLocation from "../WebComponentWrappers/ListItemLocation/ListItemLocation";
import { usePreventSwipe } from "../../hooks/usePreventSwipe";

/**
 * Show list of locations.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick - Function that is run when a location is clicked.
 * @param {function} props.onBack - Function that is run when the user navigates to the previous page.
 * @param {array} props.locations - Array of locations to be shown on the list.
 *
 */
function LocationsList({ onBack, onLocationClick, locations }) {

    const scrollableContentSwipePrevent = usePreventSwipe();

    return (
        <div className="locations-list">
            <div className="locations-list__header">
                <div className="locations-list__title">{locations?.length} Locations</div>
                <button className="locations-list__close" onClick={() => onBack()} aria-label="Close">
                    <CloseIcon />
                </button>
            </div>
            <div className="locations-list__scrollable prevent-scroll" {...scrollableContentSwipePrevent}>
                <div className="locations-list__list">
                    {locations?.map(location =>
                        <ListItemLocation
                            key={location.id}
                            location={location}
                            locationClicked={e => onLocationClick(e)}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default LocationsList;
