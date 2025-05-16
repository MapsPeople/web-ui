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
import { createPortal } from 'react-dom';

function ViewSelector() {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [buildingsData, setBuildingsData] = useState([]);
    const isDesktop = useIsDesktop();
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const currentVenueName = useRecoilValue(currentVenueNameState);
    const viewSelectorMountPoint = '.view-selector-portal';
    const [portalContainer, setPortalContainer] = useState(null);

    // Effect to find the portal target DOM node.
    // It tries to find it immediately, and if not found,
    // uses a MutationObserver to detect when it's added to the DOM.
    useEffect(() => {
        // Attempt to find the target immediately
        let target = document.querySelector(viewSelectorMountPoint);
        if (target) {
            setPortalContainer(target);
            return; // Found it, no observer needed
        }

        // If not found, set up a MutationObserver
        const observer = new MutationObserver(() => {
            target = document.querySelector(viewSelectorMountPoint);
            if (target) {
                setPortalContainer(target);
                observer.disconnect(); // Stop observing once found - use the observer instance
            }
        });

        // Start observing the document body for additions of child elements.
        const observerTargetElement = document.body;
        const config = { childList: true, subtree: true };

        observer.observe(observerTargetElement, config);

        return () => {
            observer.disconnect(); // Cleanup observer on component unmount
        };
    }, []); // Empty dependency array, so it runs once on mount to set up the finder/observer.

    // Effect to handle the portal target and view selector visibility when screen size changes
    // This effect is responsible for updating the actualPortalTarget when the screen size changes
    useEffect(() => {
        // Function to handle portal target and view selector visibility when screen size changes
        const updateViewSelector = () => {
            // Check if portal target exists
            const target = document.querySelector(viewSelectorMountPoint);
            if (target) {
                setPortalContainer(target);
            }
        };

        // Create a resize observer
        const resizeObserver = new ResizeObserver(() => {
            updateViewSelector();
        });

        // Start observing the document body for size changes
        resizeObserver.observe(document.body);

        // Clean up the observer on component unmount or when isDesktop changes
        return () => {
            resizeObserver.disconnect();
        };
    }, [isDesktop]); // Include isDesktop in the dependency array

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
    if (buildings.length === 1) {
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

    const viewSelectorContent = (
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

    // Only attempt to create portal if the portalContainer DOM node has been found
    if (!portalContainer) {
        return null; // Don't render anything if the target isn't found
    }

    return createPortal(viewSelectorContent, portalContainer);
}

export default ViewSelector;
