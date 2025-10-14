import { useRecoilState, useRecoilValue } from 'recoil';
import './ShuttleBus.scss';
import primaryColorState from '../../atoms/primaryColorState';
import shuttleBusOnState from '../../atoms/shuttleBusOnState';
import appConfigState from '../../atoms/appConfigState';

/**
 * Shuttle Bus component which uses the mi-toggle and displays an info tooltip.
 */
function ShuttleBus() {
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
            style={{ backgroundColor: shuttleBusOn ? primaryColor : '' }} />
        <div>{appConfig?.appSettings?.includeTransitSelectionDescription || 'Include bus transportation'}</div>
    </div>
}

export default ShuttleBus;
