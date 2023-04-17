import React from "react";
import './ExternalIds.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';

/**
 * Show external ids list.
 *
 * @param {Object} props
 * @param {function} props.onLocationClick
 * @param {function} props.onBack - Function that is run when the user navigates to the previous page.
 * @param {array} props.externalIds
 * @returns
 */
function ExternalIds({ onBack, onLocationClick, externalIds }) {
    return (
        <div className="externalIds">
            <div className="externalIds__header">
                <div className="externalIds__title">External Ids</div>
                <button className="externalIds__close" onClick={() => onBack()} aria-label="Close">
                    <CloseIcon />
                </button>
            </div>
            <div className="externalIds__list">
                <p>External id 1</p>
                {externalIds}
                {/* {externalIds.map((externalId) => {
                    <p>{externalId}</p>
                })} */}
            </div>
        </div>
    )
}

export default ExternalIds;
