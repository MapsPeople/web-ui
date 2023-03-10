import React, { useContext, useEffect, useState } from "react";
import './Directions.scss';
import { MapsIndoorsContext } from '../../MapsIndoorsContext';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { ReactComponent as ClockIcon } from '../../assets/clock.svg';
import { ReactComponent as WalkingIcon } from '../../assets/walking.svg';
import useMediaQuery from '../../hooks/useMediaQuery';

const mapsindoors = window.mapsindoors;

function Directions({ isOpen, onBack, directions }) {

    const [totalDistance, setTotalDistance] = useState();
    const [totalTime, setTotalTime] = useState();

    const mapsIndoorsInstance = useContext(MapsIndoorsContext);

    const isDesktop = useMediaQuery('(min-width: 992px)');

    useEffect(() => {
        if (isOpen && directions) {
            setTotalDistance(directions.totalDistance);
            setTotalTime(directions.totalTime);

            // 6 percent of smallest of viewport height or width
            const padding = Math.min(window.innerHeight, window.innerWidth) * 0.06;

            const directionsRenderer = new mapsindoors.directions.DirectionsRenderer({
                mapsIndoors: mapsIndoorsInstance,
                fitBoundsPadding: {
                    top: padding,
                    bottom: isDesktop ? padding : getBottomSheetHeight(),
                    left: isDesktop ? getSidebarWidth() : padding,
                    right: padding
                }

            });

            directionsRenderer.setRoute(directions.directionsResult);
        }
    }, [isOpen, directions, mapsIndoorsInstance]);

    /**
     * Get the height of the bottom sheet in pixels.
    */
    function getBottomSheetHeight() {
        const bottomSheet = document.querySelector('.sheet--active');
        // Subtract the top padding from the inner height of the window.
        return window.innerHeight - bottomSheet.offsetTop;
    }

    /**
     * Get the width of the sidebar in pixels
    */
    function getSidebarWidth() {
        const sidebar = document.querySelector('.modal--open');
        // Subtract the sum of the sidebar's width and the left padding from the inner width of the window.
        return window.innerWidth - (sidebar.offsetWidth + sidebar.offsetLeft);
    }

    return (
        <div className="directions">
            <div className="directions__details">
                <button className="directions__close" onClick={() => onBack()} aria-label="Close">
                    <CloseIcon />
                </button>
                <div className="directions__locations">
                    <div className="directions__container">
                        <label className="directions__label">
                            To
                        </label>
                        {directions?.destinationLocation && <div>{directions.destinationLocation.properties.name}</div>}
                    </div>
                    <div className="directions__container">
                        <label className="directions__label">
                            From
                        </label>
                        {directions?.originLocation && <div>{directions.originLocation.properties.name}</div>}
                    </div>
                </div>
            </div>
            <div className="directions__guide">
                <div className="directions__info">
                    <div className="directions__distance">
                        <WalkingIcon />
                        <div>Distance:</div>
                        <div className="directions__meters">{totalDistance && <mi-distance meters={totalDistance} />}</div>
                    </div>
                    <div className="directions__time">
                        <ClockIcon />
                        <div>Estimated time:</div>
                        <div className="directions__minutes">{totalTime && <mi-time seconds={totalTime} />}</div>
                    </div>
                </div>
                <hr></hr>
                <div className="directions__steps">
                    Steps
                </div>
            </div>
        </div>
    )
}

export default Directions;