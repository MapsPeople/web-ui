import React, { useEffect, useState } from "react";
import './LegendDialog.scss';
import { useRecoilState, useRecoilValue } from "recoil";
import primaryColorState from "../../atoms/primaryColorState";
import showLegendDialogState from "../../atoms/showLegendDialogState";
import { useTranslation } from "react-i18next";
import kioskLocationState from "../../atoms/kioskLocationState";


/**
 * Handle the Legend dialog.
 *
 */
function LegendDialog() {
    const { t } = useTranslation();
    const [, setShowLegendDialog] = useRecoilState(showLegendDialogState);
    const primaryColorProp = useRecoilValue(primaryColorState);

    const kioskLocation = useRecoilValue(kioskLocationState)

    const [legendSections, setLegendSections] = useState([]);


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

    return (<>
        <div className="background"></div>
        <div className="legend">
            {legendSections.length > 0 && <div className="legend">
                {legendSections.map((legendSection, index) => <div key={index} className="legend__section">
                    <h2>{legendSection.heading}</h2>
                    <p>{legendSection.content}</p>
                </div>)}
                <button className="legend__button" style={{ background: primaryColorProp }} onClick={() => setShowLegendDialog(false)}>{t('Close')}</button>
            </div>}

        </div>
    </>
    )
}

export default LegendDialog;