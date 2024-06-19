import { useRecoilState, useRecoilValue } from 'recoil';
import Tooltip from '../Tooltip/Tooltip';
import './Accessibility.scss';
import primaryColorState from '../../atoms/primaryColorState';
import accessibilityOnState from '../../atoms/accessibilityOnState';
import accessibilityState from '../../atoms/accessibilityState';
import { t } from 'i18next';
import { useEffect } from 'react';

/**
 * Accessibility component which uses the mi-toggle and displays an info tooltip.
 * @param {function} props.onAccessibilityChanged - Callback that fires when the accessibility has changed.
 *
 */
function Accessibility({ onAccessibilityChanged }) {
    const primaryColor = useRecoilValue(primaryColorState);

    const [accessibilityOn, setAccessibilityOn] = useRecoilState(accessibilityOnState);

    const accessibility = useRecoilValue(accessibilityState);

    // If the accessibility is defined as true, then setAccessibilityOn to true.
    useEffect(() => {
        if (accessibility) {
            setAccessibilityOn(accessibility)
        }
    }, [accessibility])

    /**
     * Handle changes in the Accessibility component.
     */
    function handleAccessibilityChanged(event) {
        setAccessibilityOn(event.target.checked);

        // If the callback function is present, fire the callback
        if (onAccessibilityChanged) {
            onAccessibilityChanged();
        }
    }

    return <div className="accessibility">
        <input className="mi-toggle"
            type="checkbox"
            checked={accessibilityOn}
            onChange={event => handleAccessibilityChanged(event)}
            style={{ backgroundColor: accessibilityOn ? primaryColor : '' }} />
        <div>{t('Accessibility')}</div>
        <Tooltip text={t('Turn on Accessibility to get directions that avoid stairs and escalators.')}></Tooltip>
    </div>
}

export default Accessibility;
