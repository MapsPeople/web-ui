import React, { useEffect, useRef, useState } from "react";
import './LegendDialog.scss';
import { useRecoilState, useRecoilValue } from "recoil";
import primaryColorState from "../../atoms/primaryColorState";
import isLegendDialogVisibleState from "../../atoms/isLegendDialogVisibleState";
import { useTranslation } from "react-i18next";
import kioskLocationState from "../../atoms/kioskLocationState";
import { useIsKioskContext } from "../../hooks/useIsKioskContext";
import legendHeightState from "../../atoms/legendHeightState";
import getLegendSortedFields from "../../helpers/GetLegendSortedFields";

/**
 * Handle the Legend dialog.
 *
 */
function LegendDialog() {
    const { t } = useTranslation();
    const primaryColorProp = useRecoilValue(primaryColorState);

    const kioskLocation = useRecoilValue(kioskLocationState)

    const legendSections = getLegendSortedFields(kioskLocation);

    const isKioskContext = useIsKioskContext();

    const legendModalRef = useRef();

    const legendSectionRef = useRef();

    const scrollButtonsRef = useRef();

    const [showLegendDialog, setShowLegendDialog] = useRecoilState(isLegendDialogVisibleState);

    const [legendHeight, setLegendHeight] = useRecoilState(legendHeightState);

    const [showScrollButtons, setShowScrollButtons] = useState(false);

    const legendSectionsRef = useRef();

    /*
     * Get the height of the legend sections. 
     * Set the legend size atom and determine 
     * if the scroll buttons should be shown.
     */
    useEffect(() => {
        if (showLegendDialog && isKioskContext) {
            if (legendSectionRef.current.clientHeight > 700) {
                setLegendHeight(legendSectionRef.current.clientHeight);
                setShowScrollButtons(true);
            } else {
                setShowScrollButtons(false);
            }
        }
    }, [showLegendDialog, isKioskContext]);

    /*
     * Setup scroll buttons to scroll in legend sections when in kiosk mode.
     */
    useEffect(() => {
        if (showLegendDialog && isKioskContext && showScrollButtons) {
            const legendContent = document.querySelector('.legend__sections');
            scrollButtonsRef.current.scrollContainerElementRef = legendContent;
        }
    }, [showLegendDialog, legendSections, showScrollButtons]);

    return (<>
        <div className="background"></div>
        <div className="legend" ref={legendModalRef}>
            {legendSections.length > 0 &&
                <div className={`legend__sections ${legendHeight > 700 ? 'legend__sections--scrollable' : ''}`}
                    ref={legendSectionsRef}
                    style={{ maxHeight: legendHeight > 700 ? '700px' : 'auto', overflowY: legendHeight > 700 ? 'scroll' : 'auto' }}>
                    {legendSections.map((legendSection, index) => <div key={index} className="legend__section" ref={legendSectionRef}>
                        <div className="legend__heading">{legendSection.heading}</div>
                        <div className="legend__content">{legendSection.content}</div>
                    </div>)}
                </div>}
            <button className="legend__button" style={{ background: primaryColorProp }} onClick={() => setShowLegendDialog(false)}>{t('Close')}</button>

            { /* Buttons to scroll in the list of search results if in kiosk context */}
            {isKioskContext && showLegendDialog && showScrollButtons &&
                <div className="scroll-buttons">
                    <mi-scroll-buttons ref={scrollButtonsRef}></mi-scroll-buttons>
                </div>
            }
        </div>

    </>
    )
}

export default LegendDialog;