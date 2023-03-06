import { ReactComponent as QuestionIcon } from '../../assets/question.svg';
import './Tooltip.scss';

function Tooltip() {
    return <div className="tooltip">
        <QuestionIcon />
        <div className="tooltip__text">
            <p>Turn on Accessibility to get directions that avoids stairs and escalators.</p>
            <i></i>
        </div>
    </div>
}

export default Tooltip;
