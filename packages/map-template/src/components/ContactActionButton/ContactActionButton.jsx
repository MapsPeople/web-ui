import PropTypes from 'prop-types';
import './ContactActionButton.scss'

const detailTypes = {
    email: 'email',
    phone: 'phone',
};

ContactActionButton.propTypes = {
    detailType: PropTypes.string,
    active: PropTypes.bool,
    displayText: PropTypes.string,
    value: PropTypes.string,
    icon: PropTypes.string
};

/**
 * A button component that renders different types of contact actions (email, phone, website)
 * with appropriate icons and click handlers. The button can open email clients, phone dialers,
 * or external links based on the contact type.
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
    // Early exit for inactive or opening hours buttons (opening hours are displayed in a different component)
    if (!active || detailType.toLowerCase() === 'openinghours') return null;

    // Use displayText if available and non-empty, otherwise fallback to value
    const textToDisplay = !displayText?.trim() ? value : displayText;

    const generateURL = (detailType, value) => {
        switch (detailType.toLowerCase()) {
            case detailTypes.email:
                return `mailto:${value}`; // Opens default email client
            case detailTypes.phone:
                return `tel:${value}`; // Opens phone dialer
            default:
                try {
                    new URL(value);
                    return value;
                } catch {
                    return '#'; // If the value is not a valid URL, return '#' to prevent navigation
                }
        }
    };

    return (
        <a
            className="contact-action-button"
            href={generateURL(detailType, value)}
            target={detailType.toLowerCase() === 'email' || detailType.toLowerCase() === 'phone' ? '_self' : '_blank'}
            rel="noopener noreferrer">
            <div className="contact-action-button__icon-wrapper">
                <img alt="" src={icon} className="contact-action-button__icon" />
            </div>
            <span className="contact-action-button__text">{textToDisplay}</span>
        </a>
    );
}

export default ContactActionButton;