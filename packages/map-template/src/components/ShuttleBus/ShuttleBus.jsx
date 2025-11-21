import { useRecoilState, useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import './ShuttleBus.scss';
import primaryColorState from '../../atoms/primaryColorState';
import shuttleBusOnState from '../../atoms/shuttleBusOnState';
import appConfigState from '../../atoms/appConfigState';

/**
 * Shuttle Bus component which uses the mi-toggle and displays an info tooltip.
 */
function ShuttleBus() {
    const { t } = useTranslation();
    const primaryColor = useRecoilValue(primaryColorState);
    const appConfig = useRecoilValue(appConfigState)
    const [shuttleBusOn, setShuttleBusOn] = useRecoilState(shuttleBusOnState);

    /**
     * Handle changes in the Shuttle Bus component.
     */
    function handleShuttleBusChanged(event) {
        setShuttleBusOn(event.target.checked);
    }
    
    return <div className="shuttle-bus">
        <input className="mi-toggle"
            type="checkbox"
            checked={shuttleBusOn}
            onChange={event => handleShuttleBusChanged(event)}
            aria-label={appConfig?.appSettings?.includeTransitSelectionDescription || t('Include bus transportation')}
            style={{ backgroundColor: shuttleBusOn ? primaryColor : '' }} />
        <div>{appConfig?.appSettings?.includeTransitSelectionDescription || 'Include bus transportation'}</div>
    </div>
}

export default ShuttleBus;
