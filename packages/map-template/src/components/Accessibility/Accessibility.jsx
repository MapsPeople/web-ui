import { useRecoilState, useRecoilValue } from 'recoil';
import Tooltip from '../Tooltip/Tooltip';
import './Accessibility.scss';
import primaryColorState from '../../atoms/primaryColorState';
import accessibilityOnState from '../../atoms/accessibilityOnState';
import { t } from 'i18next';

/**
 * Accessibility component which uses the mi-toggle and displays an info tooltip.
 *
 */
function Accessibility() {
    const primaryColor = useRecoilValue(primaryColorState);

    const [accessibilityOn, setAccessibilityOn] = useRecoilState(accessibilityOnState)

    return <div className="accessibility">
        <input className="mi-toggle" type="checkbox" checked={accessibilityOn} onChange={e => setAccessibilityOn(e.target.checked)} style={{ backgroundColor: accessibilityOn ? primaryColor : '' }} />
        <div>{t('Accessibility')}</div>
        <Tooltip text={t('Turn on Accessibility to get directions that avoid stairs and escalators.')}></Tooltip>
    </div>
}

export default Accessibility;
