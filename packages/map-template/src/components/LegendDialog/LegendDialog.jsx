import React, { useEffect, useRef, useState } from "react";
import './LegendDialog.scss';
import { useRecoilState, useRecoilValue } from "recoil";
import primaryColorState from "../../atoms/primaryColorState";
import showLegendDialogState from "../../atoms/showLegendDialogState";
import { useTranslation } from "react-i18next";
import kioskLocationState from "../../atoms/kioskLocationState";
import { useIsKioskContext } from "../../hooks/useIsKioskContext";
import { createPortal } from "react-dom";
import legendHeightState from "../../atoms/legendHeightState";
import getLegendSectionsHeight from "../../helpers/GetLegendSectionsHeight";
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

    const [showLegendDialog, setShowLegendDialog] = useRecoilState(showLegendDialogState);

    const [legendHeight, setLegendHeight] = useRecoilState(legendHeightState);

    const [showScrollButtons, setShowScrollButtons] = useState(false);

    /*
     * Get the height of the legend sections. 
     * Set the legend size atom and determine 
     * if the scroll buttons should be shown.
     */
    useEffect(() => {
        if (showLegendDialog && isKioskContext) {
            getLegendSectionsHeight().then(height => {
                if (height > 700) {
                    setLegendHeight(height);
                    setShowScrollButtons(true);
                } else {
                    setShowScrollButtons(false);
                }
            });
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
                    style={{ maxHeight: legendHeight > 700 ? '700px' : 'auto' }}>
                    {legendSections.map((legendSection, index) => <div key={index} className="legend__section" ref={legendSectionRef}>
                        <div className="legend__heading">{legendSection.heading}</div>
                        <div className="legend__content">{legendSection.content}</div>
                    </div>)}
                </div>}
            <button className="legend__button" style={{ background: primaryColorProp }} onClick={() => setShowLegendDialog(false)}>{t('Close')}</button>
        </div>

        { /* Buttons to scroll in the list of search results if in kiosk context */}
        {isKioskContext && showLegendDialog && showScrollButtons && createPortal(
            <div className="scroll-buttons">
                <mi-scroll-buttons ref={scrollButtonsRef}></mi-scroll-buttons>
            </div>,
            document.querySelector('.legend')
        )}
    </>
    )
}

export default LegendDialog;