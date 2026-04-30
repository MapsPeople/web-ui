import { useEffect, useState, useRef } from 'react';
import './Directions.scss';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import ArrowRight from '../../assets/arrow-right.svg?react';
import ArrowLeft from '../../assets/arrow-left.svg?react';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import travelModeState from '../../atoms/travelModeState';
import QRCode from '../../assets/qrcode.svg?react';
import RouteInstructions from '../RouteInstructions/RouteInstructions';
import directionsResponseState from '../../atoms/directionsResponseState';
import activeStepState from '../../atoms/activeStep';
import { snapPoints } from '../../constants/snapPoints';
import substepsToggledState from '../../atoms/substepsToggledState';
import currentLocationState from '../../atoms/currentLocationState';
import getDesktopPaddingLeft from '../../helpers/GetDesktopPaddingLeft';
import getMobilePaddingBottom from '../../helpers/GetMobilePaddingBottom';
import getDesktopPaddingBottom from '../../helpers/GetDesktopPaddingBottom';
import kioskLocationState from '../../atoms/kioskLocationState';
import qrCodeLinkState from '../../atoms/qrCodeLinkState';
import Accessibility from '../Accessibility/Accessibility';
import isDestinationStepState from '../../atoms/isDestinationStepState';
import primaryColorState from '../../atoms/primaryColorState';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import showExternalIDsState from '../../atoms/showExternalIDsState';
import PropTypes from 'prop-types';
import baseLinkSelector from '../../selectors/baseLink';
import mapTypeState from '../../atoms/mapTypeState';
import ShuttleBus from '../ShuttleBus/ShuttleBus';
import shuttleBusOnState from '../../atoms/shuttleBusOnState';
import appConfigState from '../../atoms/appConfigState';
import RouteInstructionsStepHeader from '../WebComponentWrappers/RouteInstructionsStepHeader/RouteInstructionsStepHeader';
import { ZoomLevelValues } from '../../constants/zoomLevelValues';

let directionsRenderer;

Directions.propTypes = {
    isOpen: PropTypes.bool,
    onBack: PropTypes.func,
    onSetSize: PropTypes.func,
    onRouteFinished: PropTypes.func
};

/**
 * Show the directions view.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Indicates if the directions view is open.
 * @param {function} props.onBack - Callback that fires when the directions view is closed by the user.
 * @param {function} props.onSetSize - Callback that is fired when the component has loaded.
 * @param {function} props.onRouteFinished - Callback that fires when the route has finished.
 *
 */
function Directions({ isOpen, onBack, onSetSize, onRouteFinished }) {
    const { t } = useTranslation();
    const requestAnimationFrameId = useRef();

    // Holds the MapsIndoors DisplayRule for the destination
    const [destinationDisplayRule, setDestinationDisplayRule] = useState(null);

    const destinationInfoElement = useRef(null);

    const [totalTime, setTotalTime] = useState();

    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);

    const travelMode = useRecoilValue(travelModeState);

    const directions = useRecoilValue(directionsResponseState);

    const [activeStep, setActiveStep] = useRecoilState(activeStepState);

    const [previous, setPrevious] = useState();

    const [substepsOpen, setSubstepsOpen] = useRecoilState(substepsToggledState);

    const kioskLocation = useRecoilValue(kioskLocationState);

    const isDesktop = useIsDesktop();

    const setQRCodeLink = useSetRecoilState(qrCodeLinkState)

    const isDestinationStep = useRecoilValue(isDestinationStepState);

    const primaryColor = useRecoilValue(primaryColorState);

    const isKioskContext = useIsKioskContext();

    const showExternalIDs = useRecoilValue(showExternalIDsState);

    const baseShareLink = useRecoilValue(baseLinkSelector);

    const currentLocation = useRecoilValue(currentLocationState);

    const shuttleBusOn = useRecoilValue(shuttleBusOnState);

    const appConfig = useRecoilValue(appConfigState);

    const mapType = useRecoilValue(mapTypeState);

    useEffect(() => {
        return () => {
            setDestinationDisplayRule(null);
        }
    }, []);

    useEffect(() => {
        setDestinationDisplayRule(null);

        if (isOpen && directions) {
            setTotalTime(directions.totalTime);

            // 6 percent of smallest of viewport height or width
            const padding = Math.min(window.innerHeight, window.innerWidth) * 0.06;

            // Set the directions renderer and the route to null, in order to avoid multiple routes shown simultaneously.
            directionsRenderer?.setRoute(null);
            directionsRenderer = null;
            
            Promise.all([getBottomPadding(padding), getLeftPadding(padding)]).then(([bottomPadding, leftPadding]) => {
                const disableKioskStepMove = appConfig?.appSettings?.disableKioskStepMove === 'true';
                const disableDesktopStepMove = appConfig?.appSettings?.disableDesktopStepMove === 'true';
                const shouldFitBounds = (isKioskContext && disableKioskStepMove) || (isDesktop && !disableDesktopStepMove);

                directionsRenderer = new window.mapsindoors.directions.DirectionsRenderer({
                    mapsIndoors: mapsIndoorsInstance,
                    fitBounds: shouldFitBounds,
                    fitBoundsPadding: shouldFitBounds ? undefined : {
                        top: padding,
                        bottom: bottomPadding,
                        left: leftPadding,
                        right: padding
                    }
                });
                directionsRenderer.setRoute(directions.directionsResult).then(() => {
                    // Set the step index to be 0 in order to display the correct instruction on the map.
                    directionsRenderer.setStepIndex(0);
                    
                    // Clear selection pin to avoid dual pins - route pins will handle navigation
                    if (mapsIndoorsInstance) {
                        mapsIndoorsInstance.deselectLocation();
                    }
                });

                destinationInfoElement.current.location = directions.destinationLocation;

                // If the destination is My Position, then set the display rule to null.
                if (directions.destinationLocation.id === 'USER_POSITION') {
                    setDestinationDisplayRule(null)
                } else {
                    setDestinationDisplayRule(mapsIndoorsInstance.getDisplayRule(directions.destinationLocation));
                }

                setMinZoom(appConfig?.appSettings?.minZoom ?? ZoomLevelValues.minZoom);
            });
        }
        
        return () => {
            // Cleanup: stop rendering directions when component unmounts or dependencies change
            if (directionsRenderer) {
                directionsRenderer.setRoute(null);
                directionsRenderer = null;
            }
            setMinZoom(appConfig?.appSettings?.minZoom ?? ZoomLevelValues.minZoom);
        };
    }, [isOpen, directions, mapsIndoorsInstance, travelMode, shuttleBusOn, appConfig]);


    /**
     * Get bottom padding when getting directions.
     * Calculate all cases depending on the kioskLocation id prop as well.
     */
    function getBottomPadding(padding) {
        return new Promise((resolve) => {
            if (isDesktop) {
                if (kioskLocation) {
                    getDesktopPaddingBottom().then(result => resolve(result));
                } else {
                    resolve(padding);
                }
            } else {
                return getMobilePaddingBottom().then(result => resolve(result));
            }

        });
    }

    /**
     * Get left padding when getting directions.
     * Calculate all cases depending on the kioskLocation id prop as well.
     */
    function getLeftPadding(padding) {
        return new Promise((resolve) => {
            if (isDesktop) {
                if (kioskLocation) {
                    resolve(padding);
                } else {
                    getDesktopPaddingLeft().then(result => resolve(result));
                }
            } else {
                resolve(padding);
            }
        });
    }

    /*
     * Make sure directions stop rendering on the map when the Directions view is not active anymore.
     */
    useEffect(() => {
        if (!isOpen) {
            if (isKioskContext) {
                setQRCodeLink(null);
            }
            if (directionsRenderer) {
                stopRendering();
                setMinZoom(appConfig?.appSettings?.minZoom ?? ZoomLevelValues.minZoom);
            }
        }
    }, [isOpen, appConfig, setQRCodeLink, isKioskContext]);

    useEffect(() => {
        if (isKioskContext && !directions) {
            setQRCodeLink(null);
        }
    }, [directions, isKioskContext, setQRCodeLink]);


    /**
     * Transform the steps in legs to a flat array of steps.
     */
    function getRouteSteps() {
        if (!directions) {
            return [];
        }

        return directions.directionsResult.legs.reduce((accummulator, leg) => {
            for (const stepIndex in leg.steps) {
                const step = leg.steps[stepIndex];

                accummulator.push(step);
            }
            return accummulator;
        }, []);
    }

    /**
     * Render the next navigation step on the map.
     */
    function onNext() {
        if (directionsRenderer) {
            directionsRenderer.nextStep();
        }
    }

    /**
     * Render the previous navigation step on the map.
     */
    function onPrevious() {
        if (directionsRenderer) {
            directionsRenderer.previousStep();
        }
    }

    function nextStep() {
        const steps = getRouteSteps();
        setPrevious(steps[activeStep]);
        setActiveStep(activeStep + 1);
        onNext();
    }

    function previousStep() {
        const steps = getRouteSteps();
        setPrevious(steps[activeStep - 2]);
        setActiveStep(activeStep - 1);
        onPrevious();
    }

    /**
     * Stop rendering directions on the map.
     */
    function stopRendering() {
        directionsRenderer?.setRoute(null);
        directionsRenderer = null;
    }

    /**
     * Reset the substeps to 0 and close the substeps.
     * Set the size of the bottom sheet to fit the content.
     */
    function resetSubsteps() {
        setActiveStep(0);
        setSubstepsOpen(false);
    }

    /**
     * Sets minZoom for a specific map provider.
     *
     * @param {number} zoomLevel
     */
    function setMinZoom(zoomLevel) {
        const mapView = mapsIndoorsInstance?.getMapView?.();
        const map = mapView?.getMap?.();
        if (!mapsIndoorsInstance || !mapView || !map) return;
        if (mapType === 'mapbox') {
            map.setMinZoom(zoomLevel);
        } else if (mapType === 'google') {
            map.setOptions({ minZoom: zoomLevel });
        }
    }

    /**
     * Close the directions.
     * Reset the active steps and stop rendering directions.
     */
    function onDirectionsClosed() {
        resetSubsteps();
        stopRendering();
        onBack();
    }

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
     * Build the QR code link and set the state in order to show the QR code dialog.
     */
    function showQRCode() {
        const qrCodeLink = `${baseShareLink}&directionsFrom=${kioskLocation.id}&directionsTo=${currentLocation.id}`;
        setQRCodeLink(qrCodeLink);
    }

    /**
     * Set the size of the bottom sheet depending on the substepsOpen state.
     */
    useEffect(() => {
        requestAnimationFrameId.current = requestAnimationFrame(() => {// we use a requestAnimationFrame to ensure that the component has been re-rendered with the collapsed or expanded sub steps before we set the size
            if (substepsOpen) setSize(snapPoints.MAX);
        });

        return () => {
            if (requestAnimationFrameId.current) {
                cancelAnimationFrame(requestAnimationFrameId.current);
            }
        }
    }, [substepsOpen]);

    return (
        <div className="directions" style={{ display: !isKioskContext ? 'grid' : 'block' }}>
            <div className="directions__header">
                <div className="directions__minutes">{totalTime && <mi-time translations={JSON.stringify({ days: t('d'), hours: t('h'), minutes: t('min') })} seconds={totalTime} />}</div>
                <RouteInstructionsStepHeader
                    totalSteps={getRouteSteps()}
                    activeStep={activeStep}
                    previous={previous}
                    originLocation={directions?.originLocation}
                />
            </div>
            <div className="directions__steps">
                <RouteInstructions
                    steps={getRouteSteps()}
                    previous={previous}
                    originLocation={directions?.originLocation}
                    isOpen={isOpen}>
                </RouteInstructions>
            </div>
            {isKioskContext &&
                <>
                    <hr />
                    <div className="directions__kiosk">
                        <Accessibility onAccessibilityChanged={() => resetSubsteps()} />
                        {appConfig?.appSettings?.includeTransitSelection === 'true' && <ShuttleBus />}
                        {(appConfig?.appSettings?.enableKioskQrCode === 'true' || appConfig?.appSettings?.enableKioskQrCode === undefined) && <button className="directions__qr-code" onClick={() => showQRCode()} aria-label={t('Scan QR code to view route on phone')}><QRCode />{t('Scan QR code')}</button>}
                    </div>
                </>
            }
            <div className="directions__actions">
                {getRouteSteps().length > 0 &&
                    <div className={`route-instructions__actions ${!isKioskContext ? '' : 'route-instructions__actions--kiosk'}`}>
                        <button className={`route-instructions__button ${!isKioskContext ? '' : 'route-instructions__button--kiosk'}`}
                            onClick={() => previousStep()}
                            aria-label={t('Previous')}
                            disabled={activeStep === 0}>
                            <ArrowLeft />
                        </button>
                        <div className="route-instructions__overview">{t('StepYofX', { activeStep: activeStep + 1, totalSteps: getRouteSteps().length })}</div>
                        <button className={`route-instructions__button ${!isKioskContext ? '' : 'route-instructions__button--kiosk'}`}
                            onClick={() => nextStep()}
                            aria-label={t('Next')}
                            disabled={activeStep === getRouteSteps().length - 1}>
                            <ArrowRight />
                        </button>
                    </div>
                }
                <div className="directions__details">
                    {directions?.destinationLocation &&
                        <div className="directions__info">
                            {destinationDisplayRule && directions.destinationLocation.id !== 'USER_POSITION' &&
                                <div className="directions__icon">
                                    <img alt="" src={destinationDisplayRule.icon.src ? destinationDisplayRule.icon.src : destinationDisplayRule.icon} />
                                </div>}
                            <div className="directions__content">
                                <div className="directions__name">
                                    {directions?.destinationLocation.properties.name}
                                </div>
                                <mi-location-info ref={destinationInfoElement} show-external-id={showExternalIDs} />
                            </div>
                        </div>
                    }
                </div>
                {!isDestinationStep ?
                    <button className="directions__cancel" onClick={() => onDirectionsClosed()}>
                        {t('Cancel route')}
                    </button>
                    :
                    <button className="directions__finish" onClick={() => onRouteFinished()} style={{ background: primaryColor }}>
                        {t('Finish route')}
                    </button>
                }
            </div>

        </div>
    )
}

export default Directions;