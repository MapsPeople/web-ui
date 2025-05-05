import { useState } from 'react';
import { ReactComponent as ChevronDownIcon } from '../../assets/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from '../../assets/chevron-up.svg';
import { ReactComponent as QuestionMarkIcon } from '../../assets/question.svg';
import './ViewSelector.scss';

function ViewSelector() {
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Toggle button component that renders differently for mobile vs desktop
     * @param {boolean} props.isMobile Whether the component is being rendered on mobile
     * @param {string} props.buttonText Text to display on the button (desktop only)
     */
    // eslint-disable-next-line react/prop-types
    const ToggleButton = ({ isMobile, buttonText }) => {

        /** Return mobile toggle button if isMobile is true */
        if (isMobile) {
            return (
                <button className="view-selector-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
                    <QuestionMarkIcon />
                </button>
            );
        }

        /** Render desktop toggle button */
        return (
            <button className="view-selector-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
                <QuestionMarkIcon /> {/* <- ask for icon, we need to make a new one */}
                <span> {buttonText}</span>
                {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>
        );
    };

    return (
        <div className="view-selector-container">

            {isExpanded && (
                <div className="view-selector-list">
                    <button className="view-selector-option">
                        <p>Is Test</p>
                    </button>
                </div>
            )}
            <ToggleButton isMobile={false} buttonText="Pan Map to View" />
        </div>
    );
}

export default ViewSelector; 