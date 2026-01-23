import { useRef, useCallback, useEffect, useState } from 'react';
import { ReactComponent as ChatModeIcon } from '../../../assets/chat-mode-icon.svg';
import { ReactComponent as CloseIcon } from '../../../assets/close.svg';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import PropTypes from 'prop-types';
import './ChatInput.scss';

function ChatInput({ onSendMessage, isLoading, onClose }) {
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const isDesktop = useIsDesktop();

    // Auto-focus input on mount only on desktop
    useEffect(() => {
        if (inputRef.current && isDesktop) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [isDesktop]);

    // Handle sending message from input
    const handleSend = useCallback(() => {
        const messageText = inputValue.trim();
        if (!messageText || isLoading) return;

        setInputValue('');
        onSendMessage(messageText);

        // Blur input on mobile to dismiss keyboard after sending message
        if (!isDesktop && inputRef.current) {
            inputRef.current.blur();
        }
    }, [inputValue, isLoading, onSendMessage, isDesktop]);

    // Handle Enter key in input field
    const handleKeyDown = useCallback((event) => {
        // Check if IME composition is in progress
        // keyCode 229 indicates an IME (Input Method Editor) composition event,
        //We prevent Enter from submitting while the user is still composing characters.
        if (event.isComposing || event.nativeEvent?.isComposing || event.keyCode === 229) {
            return;
        }
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
                    placeholder="Ask or search about anything"
                    className="chat-input__textarea"
                    aria-label="Chat message"
                    rows={1}
                />
            </div>
            {/* {!isDesktop && (
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
            )} */}
            <button
                type="button"
                onClick={onClose}
                className="chat-input__close-button"
                aria-label="Close chat"
            >
                <CloseIcon />
            </button>
        </div>
    );
}

ChatInput.propTypes = {
    onSendMessage: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ChatInput;