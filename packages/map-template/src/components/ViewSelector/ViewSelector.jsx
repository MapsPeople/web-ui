import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { ReactComponent as ViewSelectorIcon } from '../../assets/view-selector.svg';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import './ViewSelector.scss';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

ViewSelector.propTypes = {
    isViewSelectorDisabled: PropTypes.bool,
    isViewSelectorVisible: PropTypes.bool
};

/**
 * Component for selecting and viewing buildings in a venue.
 * It provides a toggle button to expand/collapse the building list.
 * On mobile, it shows a modal with a backdrop, while on desktop it shows a dropdown.
 *
 * @returns {JSX.Element} ViewSelector component
 * @param {Object} props - Component properties
 * @param {boolean} props.isViewSelectorDisabled - Whether the ViewSelector is currently active.
 * @param {boolean} isViewSelectorVisible - Determines if View Selector is visible or not.
 */
function ViewSelector({ isViewSelectorDisabled, isViewSelectorVisible }) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [buildingsData, setBuildingsData] = useState([]);
    const [venueId, setVenueId] = useState(null);
    const isDesktop = useIsDesktop();
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const currentVenueName = useRecoilValue(currentVenueNameState);
    const viewSelectorMountPoint = '.view-selector-portal';
    const [portalContainer, setPortalContainer] = useState(null);
    const buildingListRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const MAX_BUILDINGS_DESKTOP = 6;
    const BUILDING_LIST_ITEM_HEIGHT = 60; // Height of each building list item in pixels

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
            observer?.disconnect(); // Cleanup with optional chaining
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
            resizeObserver?.disconnect(); // Cleanup with optional chaining
        };
    }, [isDesktop]); // Include isDesktop in the dependency array

    // Effect to fetch venueId from mapsIndoorsInstance when mapsIndoorsInstance and currentVenueName are available
    // Prevents some edge cases where mapsIndoorsInstance is not ready yet
    useEffect(() => {
        if (mapsIndoorsInstance && currentVenueName) {
            const venueId = mapsIndoorsInstance.getVenue()?.id;
            if (venueId) {
                setVenueId(venueId);
            }
        }
    }, [mapsIndoorsInstance, currentVenueName]);

    // Effect to fetch venueId when currentVenueName changes
    useEffect(() => {
        if (mapsIndoorsInstance && currentVenueName) {
            // Direct API call avoids stale data from mapsIndoorsInstance.getVenue() during venue transitions
            window.mapsindoors.services.VenuesService.getVenues()
                .then(venues => {
                    // Find the venue with matching name
                    const venue = venues.find(v =>
                        v.name.toLowerCase() === currentVenueName.toLowerCase());

                    if (venue?.id) {
                        setVenueId(venue.id);
                    }
                });
        }
    }, [mapsIndoorsInstance, currentVenueName]);

    // Effect to fetch buildings when venueId is available
    useEffect(() => {
        if (venueId) {
            window.mapsindoors.services.VenuesService.getBuildings(venueId)
                .then(buildingsData => {
                    setBuildingsData(buildingsData);
                });
        }
    }, [venueId]);

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

    // Add effect for handling outside clicks on desktop only
    useEffect(() => {
        // Only add listener when expanded and on desktop
        if (!(isExpanded && isDesktop)) return;

        function handleClickOutside(event) {
            // Check if click was outside the dropdown and not on the toggle button
            if (
                buildingListRef.current &&
                !buildingListRef.current.contains(event.target) &&
                toggleButtonRef.current &&
                !toggleButtonRef.current.contains(event.target)
            ) {
                setIsExpanded(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded, isDesktop]);

    // Early return if the current venue has one building or visibility of View Selector is set to false
    if (buildings.length <= 1 || isViewSelectorVisible === false) {
        return null;
    }

    /**
     * Toggle button component that expands or collapses the building list.
     */
    const ToggleButton = () => (
        <button ref={toggleButtonRef} className="view-selector__toggle-button" onClick={() => setIsExpanded(!isExpanded)} disabled={isViewSelectorDisabled}>
            <ViewSelectorIcon />
        </button>
    );

    /**
     * Render a list of buildings for the current venue
     *
     */
    const BuildingList = () => {
        // Calculate height for desktop list (based on MAX_BUILDINGS_DESKTOP value)
        const desktopListStyle = useMemo(() => {
            if (isDesktop && buildings.length > MAX_BUILDINGS_DESKTOP) {
                return {
                    height: `${MAX_BUILDINGS_DESKTOP * BUILDING_LIST_ITEM_HEIGHT}px`,
                };
            }
            return {};
        }, [isDesktop, buildings.length]);

        return (
            <div
                className="building-list"
                style={desktopListStyle}>
                {buildings.map(building => (
                    <button
                        key={building.id}
                        className="building-list__item"
                        onClick={() => handleBuildingClick(building.id)}>
                        <span>{building.name}</span>
                    </button>
                ))}
            </div>
        );
    };

    const viewSelectorContent = (
        <div className="view-selector">
            {/* Mobile view with overlay and modal */}
            {!isDesktop && isExpanded && (
                <div className="mobile-overlay">
                    {/* Backdrop with blur effect */}
                    <div className="mobile-overlay__backdrop" onClick={() => setIsExpanded(false)}></div>

                    {/* Modal container */}
                    <div className="view-selector__container view-selector__container--mobile">
                        <div className="mobile-overlay__header">
                            <button className="mobile-overlay__exit-button" onClick={() => setIsExpanded(false)}
                                aria-label={t('Close view selector')}>
                                <CloseIcon />
                            </button>
                            <span>{t('Go to view')}</span>
                        </div>
                        <BuildingList />
                    </div>
                </div>
            )}

            {/* Desktop expanded view with ref for click-outside detection */}
            {isDesktop ? (
                <div className="view-selector__button-container view-selector__button-container--desktop">
                    {isExpanded && (
                        <div
                            ref={buildingListRef}
                            className="view-selector__container view-selector__container--desktop"
                        >
                            <BuildingList />
                        </div>
                    )}
                    {/* Toggle button for desktop */}
                    <ToggleButton />
                </div>
            ) : (
                // Mobile view toggle button, rendered outside the overlay
                <ToggleButton />
            )}
        </div>
    );

    // Only attempt to create portal if the portalContainer DOM node has been found
    if (!portalContainer) {
        return null; // Don't render anything if the target isn't found
    }

    return createPortal(viewSelectorContent, portalContainer);
}

export default ViewSelector;
