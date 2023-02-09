import './Wayfinding.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';

function Wayfinding({ onClose, onBack }) {

    // FIXME: Implement properly. This is just a placeholder.

    return <div className="wayfinding">
        <div className="wayfinding__header">
            <button onClick={() => onBack()}>
                ‹
            </button>
            <button onClick={() => onClose()}>
                <CloseIcon />
            </button>
        </div>

        <p>Placeholder for wayfinding</p>
        <p>
            <input placeholder="Current position" />
        </p>
    </div>
}

export default Wayfinding;
