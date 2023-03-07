import { ReactComponent as QuestionIcon } from '../../assets/question.svg';
import './Tooltip.scss';

/**
 * A tooltip for displaying text on hover effect on desktop and tap on mobile.
 *
 * @param {Object} props
 * @param {string} props.text - The text to be displayed in the tooltip.
 */
function Tooltip({text}) {
    return <div className="tooltip">
        <QuestionIcon />
        <div className="tooltip__text">
            <p>{text}</p>
            <i></i>
        </div>
    </div>
}

export default Tooltip;
