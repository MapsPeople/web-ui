import React, { useEffect, useRef, useState } from "react";
import './LegendDialog.scss';
import { useRecoilState, useRecoilValue } from "recoil";
import primaryColorState from "../../atoms/primaryColorState";
import showLegendDialogState from "../../atoms/showLegendDialogState";
import { useTranslation } from "react-i18next";
import kioskLocationState from "../../atoms/kioskLocationState";
import { useIsKioskContext } from "../../hooks/useIsKioskContext";
import { createPortal } from "react-dom";
import legendSizeState from "../../atoms/legendSizeState";
import getLegendSectionsHeight from "../../helpers/GetLegendSectionsHeight";

/**
 * Handle the Legend dialog.
 *
 */
function LegendDialog() {
    const { t } = useTranslation();
    const primaryColorProp = useRecoilValue(primaryColorState);

    const kioskLocation = useRecoilValue(kioskLocationState)

    const [legendSections, setLegendSections] = useState([]);

    const isKioskContext = useIsKioskContext();

    const legendModalRef = useRef();

    const legendSectionRef = useRef();

    const scrollButtonsRef = useRef();

    const [showLegendDialog, setShowLegendDialog] = useRecoilState(showLegendDialogState);

    const [legendSize, setLegendSize] = useRecoilState(legendSizeState);

    const [showScrollButtons, setShowScrollButtons] = useState(false);

    useEffect(() => {
        if (!kioskLocation?.properties.fields) return;

        const legendFields = [];

        for (const customPropertyKey of Object.keys(kioskLocation.properties.fields)) {
            const index = parseInt(customPropertyKey.charAt(0));
            // Skip field if first character isn't a number.
            if (!Number.isInteger(index)) continue;

            const existingEntry = legendFields.find(i => i.index === index);
            const isHeadingEntry = customPropertyKey.toLowerCase().includes('legendheading');
            const isContentEntry = customPropertyKey.toLowerCase().includes('legendcontent');

            if (!existingEntry) {
                // Create new legend field
                const newEntry = {
                    index: index,
                    heading: isHeadingEntry ? kioskLocation.properties.fields[customPropertyKey].value : null,
                    content: isContentEntry ? kioskLocation.properties.fields[customPropertyKey].value : null
                };
                legendFields.push(newEntry);
            } else {
                // Update existing legend field
                if (isHeadingEntry) {
                    existingEntry.heading = kioskLocation.properties.fields[customPropertyKey].value;
                } else if (isContentEntry) {
                    existingEntry.content = kioskLocation.properties.fields[customPropertyKey].value;
                }
            }
        }

        const sortedFields = legendFields.sort((a, b) => a.index - b.index);
        setLegendSections(sortedFields);
    }, [kioskLocation]);

    /*
     * Get the height of the legend sections. 
     * Set the legend size atom and determine 
     * if the scroll buttons should be shown.
     */
    useEffect(() => {
        if (showLegendDialog && isKioskContext) {
            getLegendSectionsHeight().then(padding => {
                if (padding > 700) {
                    setLegendSize(padding);
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
            {legendSections.length > 0 && <div className="legend__sections" style={{ maxHeight: legendSize > 700 ? '700px' : 'auto' }}>
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