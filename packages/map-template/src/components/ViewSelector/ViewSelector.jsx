import { useState } from 'react';
import { ReactComponent as ChevronDownIcon } from '../../assets/chevron-down.svg';
import { ReactComponent as ChevronUpIcon } from '../../assets/chevron-up.svg';
import { ReactComponent as QuestionMarkIcon } from '../../assets/question.svg';
import './ViewSelector.scss';

function ViewSelector() {
    const [isExpanded, setIsExpanded] = useState(false);
    const isDesktop = window.innerWidth > 768;

    /**
     * Toggle button component that renders different content based on the isDesktop prop
     * @param {boolean} props.isDesktop Whether the component is being rendered on desktop
     * @param {string} props.buttonText Text to display on the button (desktop only)
     */
    // eslint-disable-next-line react/prop-types
    const ToggleButton = ({ isDesktop, buttonText }) => {

        /* Render mobile list toggle button if isDesktop is false */
        if (!isDesktop) {
            return (
                <button className="view-selector-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
                    <QuestionMarkIcon />
                </button>
            );
        }

        /* Render desktop list toggle button if isDesktop is true */
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
            {/* Mobile view selector container */}
            {!isDesktop && isExpanded && (
                <div className="mobile-view-selector-container">
                    <div className="mobile-header">
                        <button className="mobile-exit-button" onClick={() => setIsExpanded(false)}>X</button>
                        <span>Pan Map to View</span>
                    </div>
                    {/* Mobile view building selector list */}
                </div>
            )}

            {/* Desktop view selector container */}
            {isDesktop && isExpanded && (
                <div className="desktop-view-selector-container">
                    {/* Desktop view building selector list */}
                </div>
            )}
            
            <ToggleButton isDesktop={true} buttonText="Pan Map to View" />
        </div>
    );
}

export default ViewSelector; 