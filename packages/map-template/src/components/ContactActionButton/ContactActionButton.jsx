import PropTypes from "prop-types";
import './ContactActionButton.scss'

ContactActionButton.propTypes = {
    detailType: PropTypes.string,
    active: PropTypes.bool,
    displayText: PropTypes.string,
    value: PropTypes.string,
    icon: PropTypes.string
};

/**
 * 
 * @param {object} props
 * @param {string} props.detailType - The type of the contact detail (e.g. email, phone, website).
 * @param {boolean} props.active - Whether the button should be displayed.
 * @param {string} props.displayText - The text to display on the button.
 * @param {string} props.value - The value of the contact detail (e.g. email address, phone number, website URL).
 * @param {string} props.icon - The icon to display on the button.
 * @returns 
 */
function ContactActionButton({ detailType, active, displayText, value, icon }) {
    if (!active) return null;  // Early exit to not render the button if it is not set as active in the additional details data
    const textToDisplay = detailType.toLowerCase() === 'phone' ? value : displayText; // If the detail type is a phone number, display the phone number instead of the display text

    const handleClick = (detailType, value) => {
        switch (detailType.toLowerCase()) {
            case 'email':
                window.location.href = `mailto:${value}`; // Opens default email client
                break;
            case 'phone':
                window.location.href = `tel:${value}`; // Opens phone dialer
                break;
            default:
                window.open(value, '_blank'); // Opens any other link in new tab
                break;
        }
    };

    return (
        <button
            className="action-button"
            onClick={() => { handleClick(detailType, value) }}>
            <div className='action-button__icon-wrapper'>
                <img src={icon} className="action-button__icon" />
            </div>
            <span className="action-button_text">{textToDisplay}</span>
        </button>
    );
}

export default ContactActionButton;