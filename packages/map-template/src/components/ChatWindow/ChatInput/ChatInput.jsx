import { useRef, useCallback, useEffect, useState } from 'react';
import { ReactComponent as ChatModeIcon } from '../../../assets/chat-mode-icon.svg';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import PropTypes from 'prop-types';
import './ChatInput.scss';

function ChatInput({ onSendMessage, isLoading, primaryColor, onClose }) {
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const isDesktop = useIsDesktop();

    // Auto-focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, []);

    // Handle sending message from input
    const handleSend = useCallback(() => {
        const messageText = inputValue.trim();
        if (!messageText || isLoading) return;

        setInputValue('');
        onSendMessage(messageText);
    }, [inputValue, isLoading, onSendMessage]);

    // Handle Enter key in input field
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    return (
        <div className="chat-input">
            <div className="chat-input__wrapper">
                <ChatModeIcon className="chat-input__icon" />
                <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about locations, directions, or anything else..."
                    className="chat-input__textarea"
                    rows={1}
                />
            </div>
            {!isDesktop && (
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="chat-input__button"
                    style={{ backgroundColor: primaryColor }}
                    aria-label="Send message"
                >
                    Send
                </button>
            )}
            {isDesktop && (
                <button
                    type="button"
                    onClick={onClose}
                    className="chat-input__close-button"
                    aria-label="Close chat"
                >
                    ×
                </button>
            )}
        </div>
    );
}

ChatInput.propTypes = {
    onSendMessage: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    primaryColor: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ChatInput;