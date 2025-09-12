/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import './ChatWindow.scss';
import primaryColorState from '../../atoms/primaryColorState';

function ChatWindow({ userMessage }) {
    const primaryColor = useRecoilValue(primaryColorState);
    const [serverMessage, setServerMessage] = useState('This is a server message.');

    return (
        <div className="chat-window" style={{ '--chat-window-primary-color': primaryColor }}>
            {/* Chat window content will go here */}
            {userMessage && <p className="chat-window__message chat-window__message--user">{userMessage}</p>}
            {serverMessage && <p className="chat-window__message chat-window__message--server">{serverMessage}</p>}
        </div>
    );
}

ChatWindow.propTypes = {
    userMessage: PropTypes.string
};

export default ChatWindow;
