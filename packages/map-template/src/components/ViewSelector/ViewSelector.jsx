import { useEffect, useState, useMemo } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { ReactComponent as ChevronDownIcon } from '../../assets/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from '../../assets/chevron-up.svg';
import { ReactComponent as PanViewIcon } from '../../assets/pan-view-icon.svg';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import './ViewSelector.scss';
import { useRecoilValue } from 'recoil';

function ViewSelector() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [buildingsData, setBuildingsData] = useState([]);
    const isDesktop = useIsDesktop();
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const currentVenueName = useRecoilValue(currentVenueNameState);

    // Get all buildings for the current venue
    useEffect(() => {
        if (mapsIndoorsInstance && currentVenueName) {
            // Get the current venue
            window.mapsindoors.services.VenuesService.getVenue(currentVenueName)
                .then(() => {
                    // Get all buildings for the current venue
                    return window.mapsindoors.services.VenuesService.getBuildings();
                })
                .then(buildingsData => {
                    setBuildingsData(buildingsData);
                })
                .catch(error => {
                    console.error('Error fetching buildings:', error);
                });
        }
    }, [mapsIndoorsInstance, currentVenueName]);

    // Memoize the buildings array to prevent unnecessary re-renders
    const buildings = useMemo(() => {
        return buildingsData;
    }, [buildingsData])


    // Early return if the current venue has one building
    if (buildings.length == 1) {
        return null;
    }

    /**
     * Toggle button component that renders different content based on the isDesktop prop
     * @param {boolean} props.isDesktop Whether the component is being rendered on desktop
     * @param {string} props.buttonText Text to display on the button (desktop only)
     */
    // eslint-disable-next-line react/prop-types
    const ToggleButton = ({ buttonText }) => {

        /* Render mobile list toggle button if isDesktop is false */
        if (!isDesktop) {
            return (
                <button className="view-selector-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
                    <PanViewIcon />
                </button>
            );
        }

        /* Render desktop list toggle button if isDesktop is true */
        return (
            <button className="view-selector-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
                <PanViewIcon />
                <span> {buttonText}</span>
                {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>
        );
    };

    /**
     * Render a list of buildings for the current venue
     */
    const BuildingList = () => {
        return (
            <div className="building-list">
                {buildings.map(building => (
                    <button
                        key={building.id}
                        className="building-list-item"
                        onClick={() => {
                            mapsIndoorsInstance.fitBuilding(building.id);
                            setIsExpanded(false);
                        }}>
                        <p>{building.buildingInfo?.name}</p>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="view-selector-container">
            {/* Mobile view selector container */}
            {!isDesktop && isExpanded && (
                <div className="mobile-view-selector-container">
                    <div className="mobile-header">
                        <button className="mobile-exit-button" onClick={() => setIsExpanded(false)}>X</button>
                        <span>Pan Map to View</span>
                    </div>
                    {/* Mobile view building selector list */}
                    <BuildingList />
                </div>
            )}

            {/* Render building list directly when expanded on desktop */}
            {isDesktop && isExpanded && <BuildingList />}

            {/* Toggle button that changes appearance based on mobile/desktop */}
            <ToggleButton buttonText="Pan map to view" />
        </div>
    );
}

export default ViewSelector;