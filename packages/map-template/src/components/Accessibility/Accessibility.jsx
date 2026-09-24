import { useRecoilState, useRecoilValue } from 'recoil';
import './Accessibility.scss';
import primaryColorState from '../../atoms/primaryColorState';
import accessibilityOnState from '../../atoms/accessibilityOnState';
import { t } from 'i18next';
import PropTypes from 'prop-types';

Accessibility.propTypes = {
    onAccessibilityChanged: PropTypes.func
};

/**
 * Accessibility toggle. Stairs and escalator icons sit beside the switch so the
 * control is recognizable without reading the label. A slash is drawn across
 * the icons while the option is on.
 * @param {function} props.onAccessibilityChanged - Callback that fires when the accessibility has changed.
 *
 */
function Accessibility({ onAccessibilityChanged }) {
    const primaryColor = useRecoilValue(primaryColorState);

    const [accessibilityOn, setAccessibilityOn] = useRecoilState(accessibilityOnState);

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

    return <div className={`accessibility${accessibilityOn ? ' accessibility--on' : ''}`}>
        <label className="accessibility__label">
            <input className="mi-toggle"
                type="checkbox"
                checked={accessibilityOn}
                onChange={event => handleAccessibilityChanged(event)}
                style={{ backgroundColor: accessibilityOn ? primaryColor : '' }} />
            <span className="accessibility__icons" aria-hidden="true">
                <span className="accessibility__icon">
                    <mi-icon icon-name="stairs"></mi-icon>
                </span>
                <span className="accessibility__icon">
                    <mi-icon icon-name="escalator"></mi-icon>
                </span>
            </span>
            <span className="accessibility__text">{t('Avoid stairs and escalators')}</span>
        </label>
    </div>
}

export default Accessibility;
