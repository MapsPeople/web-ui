import PropTypes from 'prop-types';
import './ChatWindow.scss';

function ChatWindow({ userMessage }) {
    return (
        <div className="chat-window">
            {/* Chat window content will go here */}
            {userMessage && <p className="chat-window__message">{userMessage}</p>}
        </div>
    );
}

ChatWindow.propTypes = {
    userMessage: PropTypes.string
};

export default ChatWindow;
