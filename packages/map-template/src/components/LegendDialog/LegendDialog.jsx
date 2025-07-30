import { useEffect, useRef, useState } from 'react';
import './LegendDialog.scss';
import { useRecoilState, useRecoilValue } from 'recoil';
import primaryColorState from '../../atoms/primaryColorState';
import isLegendDialogVisibleState from '../../atoms/isLegendDialogVisibleState';
import { useTranslation } from 'react-i18next';
import { useIsKioskContext } from '../../hooks/useIsKioskContext';
import legendSortedFieldsSelector from '../../selectors/legendSortedFieldsSelector';

/**
 * Handle the Legend dialog.
 *
 */
function LegendDialog() {
    const { t } = useTranslation();
    const primaryColorProp = useRecoilValue(primaryColorState);

    const legendSections = useRecoilValue(legendSortedFieldsSelector);

    const isKioskContext = useIsKioskContext();

    const legendModalRef = useRef();

    const legendSectionRef = useRef();

    const scrollButtonsRef = useRef();

    const [showLegendDialog, setShowLegendDialog] = useRecoilState(isLegendDialogVisibleState);

    const [isLegendScrollable, setIsLegendScrollable] = useState(false);

    const legendSectionsRef = useRef();

    // Indicates the max height of the legend after which the dialog becomes scrollable.
    let legendHeight = 700;

    /*
     * Get the height of the legend sections. 
     * Set the legend size atom and determine 
     * if the scroll buttons should be shown.
     */
    useEffect(() => {
        if (showLegendDialog && isKioskContext) {
            setIsLegendScrollable(legendSectionsRef.current.clientHeight > legendHeight);
        }
    }, [showLegendDialog, isKioskContext]);

    /*
     * Setup scroll buttons to scroll in legend sections when in kiosk mode.
     */
    useEffect(() => {
        if (showLegendDialog && isKioskContext && isLegendScrollable) {
            const legendContent = document.querySelector('.legend__sections');
            scrollButtonsRef.current.scrollContainerElementRef = legendContent;
        }
    }, [showLegendDialog, legendSections, isLegendScrollable]);

    return (<>
        <div className="legend__background"></div>
        <div className="legend" ref={legendModalRef}>
            {legendSections.length > 0 &&
                <div className={`legend__sections ${isLegendScrollable ? 'legend__sections--scrollable' : ''}`}
                    ref={legendSectionsRef}
                    style={{ maxHeight: isLegendScrollable ? `${legendHeight}px` : 'auto', overflowY: isLegendScrollable ? 'scroll' : 'auto' }}>
                    {legendSections.map((legendSection, index) => <div key={index} className="legend__section" ref={legendSectionRef}>
                        <div className="legend__heading">{legendSection.heading}</div>
                        <div className="legend__content">{legendSection.content}</div>
                    </div>)}
                </div>}
            <button className="legend__button" style={{ background: primaryColorProp }} onClick={() => setShowLegendDialog(false)}>{t('Close')}</button>

            { /* Buttons to scroll in the list of search results if in kiosk context */}
            {isKioskContext && showLegendDialog && isLegendScrollable &&
                <div className="scroll-buttons">
                    <mi-scroll-buttons ref={scrollButtonsRef}></mi-scroll-buttons>
                </div>
            }
        </div>

    </>
    )
}

export default LegendDialog;