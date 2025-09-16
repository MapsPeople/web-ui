import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import './ChatWindow.scss';
import primaryColorState from '../../atoms/primaryColorState';

function ChatWindow({ message }) {
    const primaryColor = useRecoilValue(primaryColorState);
    const [messages, setMessages] = useState([]);

    // Generate server response based on user message
    // DEBUG ONLY: Simple mock response generator
    const generateServerResponse = () => {
        // Simple response logic - to be expanded later
        const responses = [
            'I understand. How can I help you further?',
            'That\'s interesting. Tell me more.',
            'I see. What would you like to know?',
            'Thanks for that information.',
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };
    // DEBUG ONLY: Simple mock response generator

    // Maybe expose a function to add messages, like onUserMessage, then pass it from the Search to the ChatWindow

    // Handle new message from parent component
    useEffect(() => {
        if (!message?.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: message.trim(),
            type: 'user'
        };

        setMessages(prev => [...prev, userMessage]);

        // Generate server response after a short delay
        // DEBUG ONLY: Simple mock response generator
        setTimeout(() => {
            const serverMessage = {
                id: Date.now() + 1,
                text: generateServerResponse(),
                type: 'server'
            };
            setMessages(prev => [...prev, serverMessage]);
        }, 1000);
        // DEBUG ONLY: Simple mock response generator
    }, [message]);

    return (
        <div className="chat-window" style={{ '--chat-window-primary-color': primaryColor }}>
            {messages.map((message) => (
                <p key={message.id} className={`chat-window__message chat-window__message--${message.type}`}>
                    {message.text}
                </p>
            ))}
        </div>
    );
}

ChatWindow.propTypes = {
    message: PropTypes.string
};

export default ChatWindow;
