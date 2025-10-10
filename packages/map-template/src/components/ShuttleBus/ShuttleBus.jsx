import { useRecoilState, useRecoilValue } from 'recoil';
import './ShuttleBus.scss';
import primaryColorState from '../../atoms/primaryColorState';
import shuttleBusOnState from '../../atoms/shuttleBusOnState';
import appConfigState from '../../atoms/appConfigState';
import PropTypes from 'prop-types';

ShuttleBus.propTypes = {
    onShuttleBusChanged: PropTypes.func
};

/**
 * Shuttle Bus component which uses the mi-toggle and displays an info tooltip.
 * @param {function} props.onShuttleBusChanged - Callback that fires when the shuttle bus has changed.
 *
 */
function ShuttleBus({ onShuttleBusChanged }) {
    const primaryColor = useRecoilValue(primaryColorState);
    const appConfig = useRecoilValue(appConfigState)
    const [shuttleBusOn, setShuttleBusOn] = useRecoilState(shuttleBusOnState);

    /**
     * Handle changes in the Shuttle Bus component.
     */
    function handleShuttleBusChanged(event) {
        setShuttleBusOn(event.target.checked);

        // If the callback function is present, fire the callback
        if (onShuttleBusChanged) {
            onShuttleBusChanged();
        }
    }
    console.log(appConfig);
    
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
