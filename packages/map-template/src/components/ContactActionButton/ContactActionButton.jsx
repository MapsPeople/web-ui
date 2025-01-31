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
                return `mailto:${value}`; // Opens default email client
            case 'phone':
                return `tel:${value}`; // Opens phone dialer
            default:
                return value; // Opens any other link in new tab
        }
    };

    return (
        <a
            className="contact-action-button"
            href={handleClick(detailType, value)}
            target={detailType.toLowerCase() === 'email' || detailType.toLowerCase() === 'phone' ? '_self' : '_blank'}
            rel="noopener noreferrer">
            <div className='contact-action-button__icon-wrapper'>
                <img src={icon} className="contact-action-button__icon" />
            </div>
            <span className="contact-action-button__text">{textToDisplay}</span>
        </a>
    );
}

export default ContactActionButton;