import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import './LocationDetails.scss';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { useRecoilValue } from 'recoil';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import currentLocationState from '../../atoms/currentLocationState';
import { useIsVerticalOverflow } from '../../hooks/useIsVerticalOverflow';
import { usePreventSwipe } from '../../hooks/usePreventSwipe';
import { snapPoints } from '../../constants/snapPoints';
import primaryColorState from '../../atoms/primaryColorState';
import directionsServiceState from '../../atoms/directionsServiceState';
import useDirectionsInfo from '../../hooks/useDirectionsInfo';
import travelModeState from '../../atoms/travelModeState';
import kioskLocationState from '../../atoms/kioskLocationState';
import accessibilityOnState from '../../atoms/accessibilityOnState';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import showExternalIDsState from '../../atoms/showExternalIDsState';
import useOutsideMapsIndoorsDataClick from '../../hooks/useOutsideMapsIndoorsDataClick';
import OpeningHours from './OpeningHours/OpeningHours';
import PropTypes from 'prop-types';
import ShareLocationLink from './ShareLocationLink/ShareLocationLink';
import ContactActionButton from '../ContactActionButton/ContactActionButton';
import appConfigState from '../../atoms/appConfigState';

LocationDetails.propTypes = {
    onBack: PropTypes.func,
    onStartWayfinding: PropTypes.func,
    onSetSize: PropTypes.func,
    snapPointSwiped: PropTypes.number,
    onStartDirections: PropTypes.func,
    isOpen: PropTypes.bool,
    snapPointSwipedByUser: PropTypes.string
}

/**
 * This component is used to show the details of a MapsIndoors Location.
 *
 * It will always show the location name, icon and a info about floor, building and venue.
 * and a button to start wayfinding.
 *
 * It will also show the location description, image, categories and additional details
 * if they are available.
 *
 * In case the Location description is long, it will be truncated and a button to expand the description will be shown.
 * On small screens, when the description is expanded, the bottom sheet will be expanded to full height. Also, if the user
 * swipes to full height, the description will be expanded.
 *
 * @param {object} props
 * @param {function} props.onBack - Callback that fires when Location Details are closed by the user.
 * @param {function} props.onStartWayfinding - Callback that fires when user clicks the Start Wayfinding button.
 * @param {function} props.onSetSize - Callback that is fired when the toggle full description button is clicked and the Sheet size changes.
 * @param {function} props.onStartDirections - Callback that fires when user clicks the Start directions button.
 * @param {boolean} props.isOpen - Whether the Location Details are open or not.
 * @param {function} props.snapPointSwipedByUser - Changes value when user has swiped a Bottom sheet to a new snap point.
 *
 */
function LocationDetails({ onBack, onStartWayfinding, onSetSize, onStartDirections, isOpen, snapPointSwipedByUser }) {
    const { t } = useTranslation();

    const locationInfoElement = useRef(null);
    const locationDetailsContainerRef = useRef(null);
    const locationDetailsElement = useRef(null);
    const locationDetailsDetailsRef = useRef(null);
    const locationImageRef = useRef(null);

    const [showFullDescription, setShowFullDescription] = useState(false);
    const [descriptionHasContentAbove, setDescriptionHasContentAbove] = useState(false);
    const [descriptionHasContentBelow, setDescriptionHasContentBelow] = useState(false);
    const isInFullHeightRef = useRef(false);

    // Holds the MapsIndoors DisplayRule for the location
    const [locationDisplayRule, setLocationDisplayRule] = useState(null);

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const location = useRecoilValue(currentLocationState);
    const locationAdditionalDetails = location?.properties?.additionalDetails;
    // Get the first opening hours detail that is active
    const openingHours = locationAdditionalDetails?.find(detail => detail.key.toLowerCase().includes('openinghours') && detail.active === true)?.openingHours;

    // Check if the content of the Location details is overflowing
    const [isOverflowing, initialOverflow] = useIsVerticalOverflow(location, locationDetailsElement);

    const scrollableContentSwipePrevent = usePreventSwipe();

    const primaryColor = useRecoilValue(primaryColorState);

    const kioskLocation = useRecoilValue(kioskLocationState);

    const directionsService = useRecoilValue(directionsServiceState);

    const [destinationLocation, setDestinationLocation] = useState();
    const [originLocation, setOriginLocation] = useState();
    const [showFloor, setShowFloor] = useState(true);

    const isDesktop = useIsDesktop();

    const travelMode = useRecoilValue(travelModeState);

    const accessibilityOn = useRecoilValue(accessibilityOnState);

    const [, , hasFoundRoute] = useDirectionsInfo(originLocation, destinationLocation, directionsService, travelMode, accessibilityOn)

    const showExternalIDs = useRecoilValue(showExternalIDsState);

    const clickedOutsideMapsIndoorsData = useOutsideMapsIndoorsDataClick(mapsIndoorsInstance, isOpen);

    const appConfig = useRecoilValue(appConfigState);

    const isWayfindingDisabled = appConfig?.appSettings?.excludeFromUI?.includes('wayfindingDisabled');
    
    /**
     * Check if venue has floors and set `showFloor` state accordingly
     * If venue has only one floor, we don't show the floor information in
     * the `<mi-location-info>` component.
     */
    useEffect(() => {
        const checkVenueHasFloors = () => {
            if (mapsIndoorsInstance && location) {
                try {
                    const building = mapsIndoorsInstance.getBuilding();
                    if (building && building.floors) {
                        const floorCount = Object.keys(building.floors).length;
                        setShowFloor(floorCount > 1);
                    } else {
                        setShowFloor(false);
                    }
                } catch (error) {
                    setShowFloor(true);
                }
            }
        };

        checkVenueHasFloors();
    }, [mapsIndoorsInstance, location]);

    useEffect(() => {
        return () => {
            setLocationDisplayRule(null);
            setDestinationLocation();
            setOriginLocation();
        }
    }, []);

    /**
     * Sets full description, content above/below flags to false and triggers the onBack callback.
     */
    const back = useCallback(() => {
        setShowFullDescription(false);
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
        setSize(snapPoints.FIT);

        onBack();
    });

    /**
     * Communicate size change to parent component.
     * @param {number} size
     */
    function setSize(size) {
        if (typeof onSetSize === 'function') {
            onSetSize(size);
        }
    }

    /**
     * Toggle the description text expansion.
     */
    function toggleDescription() {
        if (showFullDescription === false) {
            expandLocationDescription();
            setSize(snapPoints.MAX);
        } else {
            collapseLocationDescription();
            setSize(snapPoints.FIT);
        }
    }

    /**
     * Expand the location description to be fully shown.
     */
    function expandLocationDescription() {
        requestAnimationFrame(() => { // Necessary to preserve transition
            setShowFullDescription(true);
            setScrollIndicators();
            isInFullHeightRef.current = true;
        });
    }

    /**
     * Collapse the location description to be truncated.
     */
    function collapseLocationDescription() {
        setShowFullDescription(false);
        unsetScrollIndicators();
        isInFullHeightRef.current = false;
    }

    /**
     * Scroll indicators adds a gradient to either the top or the bottom,
     * indicating if there is more content above or below what is visible.
     */
    function setScrollIndicators() {
        const frameId = requestAnimationFrame(() => {
            if (locationDetailsContainerRef.current) {
                setDescriptionHasContentAbove(locationDetailsContainerRef.current.scrollTop > 0);
                setDescriptionHasContentBelow(
                    locationDetailsContainerRef.current.scrollTop <
                    (locationDetailsContainerRef.current.scrollHeight -
                        locationDetailsContainerRef.current.offsetHeight - 1)
                );
            }
        });

        return () => cancelAnimationFrame(frameId);
    }

    /**
     * Remove scroll indicators.
     */
    function unsetScrollIndicators() {
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
    }

    /**
     * Start wayfinding, making some cleanup first.
     */
    function startWayfinding() {
        setShowFullDescription(false);
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
        setSize(snapPoints.FIT);

        onStartWayfinding();
    }

    /**
     * Start directions, making some cleanup first.
     */
    function startDirections() {
        setShowFullDescription(false);
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
        setSize(snapPoints.FIT);

        onStartDirections();
    }

    /*
     * Closes location details when user clicks outside MapsIndoors data.
     */
    useEffect(() => {
        if (clickedOutsideMapsIndoorsData) {
            onBack();
        }
    }, [clickedOutsideMapsIndoorsData]);

    /*
     * Cleanup on unmount: resets location display rule and direction locations.
     */
    useEffect(() => {
        return () => {
            setLocationDisplayRule(null);
            setDestinationLocation();
            setOriginLocation();
        }
    }, []);

    /*
     * Updates location details and routing state when location dependencies change.
     */
    useEffect(() => {
        // Reset state
        setShowFullDescription(false);
        setDescriptionHasContentAbove(false);
        setDescriptionHasContentBelow(false);
        setLocationDisplayRule(null);

        if (location) {
            locationInfoElement.current.location = location;
            setLocationDisplayRule(mapsIndoorsInstance.getDisplayRule(location));
            setDestinationLocation(location)
        }

        if (kioskLocation) {
            setOriginLocation(kioskLocation)
        }
    }, [location, mapsIndoorsInstance, kioskLocation]);

    useEffect(() => {
        const hasAdditionalDetails = locationAdditionalDetails?.length > 0;
        // Expand the sheet when location changes, is open, and has additional details
        if (location && isOpen && hasAdditionalDetails) {
            setSize(snapPoints.FIT);
        } else {
            setSize(snapPoints.MIN);
        }
    }, [location, isOpen, locationAdditionalDetails]);

    /*
     * When user swipes the bottom sheet to a new snap point.
     */
    useEffect(() => {
        if (!snapPointSwipedByUser) {
            isInFullHeightRef.current = false;
            return;
        }

        // If swiping to max height, expand location details.
        // If swiping to smaller height, collapse location details.
        setShowFullDescription(snapPointSwipedByUser === snapPoints.MAX);
        if (snapPointSwipedByUser === snapPoints.MAX) {
            expandLocationDescription();
        } else {
            collapseLocationDescription();
        }
    }, [snapPointSwipedByUser]);

    /**
     * useLayoutEffect is used here to ensure that DOM measurements (heights) are accurate
     * before the browser paints. This prevents visual flicker and ensures the modal height
     * is set correctly based on the rendered content, especially when content or state changes.
     * This is needed for the gradient scroll indicators to work correctly.
     * Note: This effect runs only on desktop screens and not on mobile screens.
     */
    useLayoutEffect(() => {
        const modalOpenRef = document.querySelector('.modal.modal--open');
        if (!modalOpenRef || !locationDetailsDetailsRef?.current || !locationDetailsContainerRef?.current) return;

        // Simplified approach focusing on the location image only
        const checkHeightAndSetup = () => {
            const modalHeight = modalOpenRef.offsetHeight;
            const contentHeight = locationDetailsContainerRef.current.offsetHeight;

            if (modalHeight > 0 && contentHeight > 0) {
                // Use a relative threshold: content should be at least 90% of modal height to trigger full height
                const contentToModalRatio = contentHeight / modalHeight;
                if (contentToModalRatio > 0.9) {
                    modalOpenRef.style.height = '100%';
                    setScrollIndicators();
                } else {
                    modalOpenRef.style.height = 'auto';
                }
            }
        };

        // Check if the location has an image we need to wait for before calculating heights
        // Images can significantly affect layout height, and measuring before they load would give incorrect results
        // This ensures we get accurate contentHeight measurements for proper modal sizing and scroll indicators
        if (locationImageRef.current) {
            // If the image is already loaded (from cache), we can proceed immediately with calculations
            if (locationImageRef.current.complete) {
                checkHeightAndSetup();
            } else {
                // Otherwise, we must wait for the image to load to get accurate height measurements
                locationImageRef.current.onload = checkHeightAndSetup;
                locationImageRef.current.onerror = checkHeightAndSetup; // Also handle load failures to ensure we don't block the UI
            }
        } else {
            // No image to wait for, proceed immediately
            checkHeightAndSetup();
        }

        // Cleanup function
        return () => {
            modalOpenRef.style.height = '';
            // Clean up any potential event listeners
            if (locationImageRef.current) {
                locationImageRef.current.onload = null;
                locationImageRef.current.onerror = null;
            }
        };
    }, [location, showFullDescription, isOpen, locationAdditionalDetails]);

    return <div className={`location-details ${isInFullHeightRef.current === true ? 'location-details--max-height' : ''} ${descriptionHasContentAbove ? 'location-details--content-above' : ''} ${descriptionHasContentBelow ? 'location-details--content-below' : ''}`}>
        {location && <>
            <div className="location-details__header">
                <div className="location-info">
                    <div className="location-info__icon">
                        {locationDisplayRule && <img alt="" src={locationDisplayRule.icon.src ? locationDisplayRule.icon.src : locationDisplayRule.icon} />}
                    </div>
                    <div className="location-info__content">
                        <div className="location-info__name">
                            {location.properties.name}
                        </div>
                        <mi-location-info level={t('Level')} ref={locationInfoElement} show-external-id={showExternalIDs} show-floor={showFloor} />
                    </div>
                    <div className="location-info__actions">
                        <ShareLocationLink buttonClassName="location-info__button" location={location} />
                        <button className="location-info__button" onClick={() => back()} aria-label={t('Close')}>
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                {/* Wayfinding Button */}
                {!isWayfindingDisabled && (
                    kioskLocation && isDesktop ? (
                        <button
                            disabled={!hasFoundRoute}
                            onClick={() => startDirections()}
                            className={`location-details__wayfinding ${!hasFoundRoute ? 'location-details--no-route' : ''}`}
                            style={{ background: primaryColor }}
                        >
                            {!hasFoundRoute ? t('Directions not available') : t('Start directions')}
                        </button>
                    ) : (
                        <button
                            onClick={() => startWayfinding()}
                            style={{ background: primaryColor }}
                            className="location-details__wayfinding"
                        >
                            {t('Start wayfinding')}
                        </button>
                    )
                )}
            </div>
            <div
                className="location-details__details prevent-scroll"
                {...scrollableContentSwipePrevent}
                ref={locationDetailsDetailsRef}
            >
                <div
                    ref={locationDetailsContainerRef}
                    onScroll={e => setScrollIndicators(e)}
                    className="location-details__details-content">
                    {/* Location image */}
                    {location.properties.imageURL && <img ref={locationImageRef} alt="" src={location.properties.imageURL} className="location-details__image" />}

                    {/* Location categories */}
                    {Object.keys(location.properties.categories).length > 0 && <p className="location-details__categories">
                        {Object.values(location.properties.categories).map((category, index, array) => {
                            return <React.Fragment key={category}>{category}{index < array.length - 1 && <>・</>}</React.Fragment>
                        })}
                    </p>}
                    {/* Location description */}
                    {location.properties.description && (
                        <section className={`location-details__description ${showFullDescription ? 'location-details__description--full' : ''}`}>
                            <div ref={locationDetailsElement}>
                                {location.properties.description}
                            </div>
                            {(isOverflowing || initialOverflow || showFullDescription) && (
                                <button onClick={() => toggleDescription()}>
                                    {t(showFullDescription ? 'Close' : 'Read full description')}
                                </button>
                            )}
                        </section>
                    )}

                    {/*Contact action / opening hours button container */}
                    {locationAdditionalDetails && <div className="contact-action-buttons-container">
                        {locationAdditionalDetails.map(button => (
                            <ContactActionButton
                                key={button.key}
                                detailType={button.detailType}
                                active={button.active}
                                displayText={button.displayText}
                                value={button.value}
                                icon={button.icon}
                            />
                        ))}
                        {openingHours && <OpeningHours openingHours={openingHours} onExpand={() => setScrollIndicators()} />}
                    </div>}
                </div>
            </div>
        </>}
    </div>
}

export default LocationDetails;
