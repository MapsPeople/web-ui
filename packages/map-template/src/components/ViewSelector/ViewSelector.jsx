import { useEffect, useState, useMemo, useCallback } from 'react';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { ReactComponent as ChevronDownIcon } from '../../assets/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from '../../assets/chevron-up.svg';
import { ReactComponent as PanViewIcon } from '../../assets/pan-view-icon.svg';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import './ViewSelector.scss';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

function ViewSelector() {
    const { t } = useTranslation();
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

    // Extract only necessary building properties to create a simplified data structure, memoize the result
    const buildings = useMemo(() => {
        return buildingsData.map(building => ({
            id: building.id,
            name: building.buildingInfo.name,
        }));
    }, [buildingsData]);

    // Handle building click event - uses useCallback to maintain a stable reference
    // This prevents creating new function instances on each render when passed to BuildingList items
    const handleBuildingClick = useCallback((buildingId) => {
        mapsIndoorsInstance.fitBuilding(buildingId);
        setIsExpanded(false);
    }, [mapsIndoorsInstance]);

    // Early return if the current venue has one building
    if (buildings.length == 1) {
        return null;
    }

    /**
     * Toggle button component that renders different content based on the isDesktop prop
     * @param {boolean} props.isDesktop Whether the component is being rendered on desktop
     */
    const ToggleButton = () => {
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
                <span> {t('Pan Map to view')}</span>
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
                        onClick={() => handleBuildingClick(building.id)}>
                        <p>{building.name}</p>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Mobile view with overlay and modal */}
            {!isDesktop && isExpanded && (
                <div className="mobile-overlay">
                    {/* Backdrop with blur effect */}
                    <div className="modal-backdrop" onClick={() => setIsExpanded(false)}></div>

                    {/* Modal container */}
                    <div className="view-selector-container mobile">
                        <div className="mobile-header">
                            <button className="mobile-exit-button" onClick={() => setIsExpanded(false)}>{<CloseIcon />}</button>
                            <span>{t('Pan Map to View')}</span>
                        </div>
                        <BuildingList />
                    </div>
                </div>
            )}

            {/* Desktop expanded view */}
            {isDesktop && isExpanded && (
                <div className="view-selector-container desktop">
                    <BuildingList />
                </div>
            )}

            {/* Toggle button - always visible, positioned differently based on viewport */}
            <div className={`view-selector-button-container ${isDesktop ? 'desktop' : 'mobile'}`}>
                <ToggleButton />
            </div>
        </>
    );
}

export default ViewSelector;