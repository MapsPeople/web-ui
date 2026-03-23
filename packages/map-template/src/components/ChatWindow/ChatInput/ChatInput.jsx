import { useRef, useCallback, useEffect, useState } from 'react';
import ChatModeIcon from '../../../assets/chat-mode-icon.svg?react';
import CloseIcon from '../../../assets/close.svg?react';
import SendIcon from '../../../assets/send.svg?react';
import { useIsDesktop } from '../../../hooks/useIsDesktop';
import PropTypes from 'prop-types';
import './ChatInput.scss';

function ChatInput({ onSendMessage, isLoading, onClose, disabled, primaryColor }) {
    const inputRef = useRef(null);
    const [inputValue, setInputValue] = useState('');
    const isDesktop = useIsDesktop();

    // Auto-focus input on mount only on desktop and when not disabled
    useEffect(() => {
        if (inputRef.current && isDesktop && !disabled) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [isDesktop, disabled]);

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
            <div className={`chat-input__wrapper${disabled ? ' chat-input__wrapper--disabled' : ''}`}>
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
                    disabled={disabled}
                />
                {!isDesktop && (
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading || disabled}
                        className="chat-input__send-button"
                        style={{ backgroundColor: inputValue.trim() && !isLoading && !disabled ? primaryColor : undefined }}
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                )}
            </div>
            {/* Remove from tab order while usage consent overlay is visible to prevent accidental closes */}
            <button
                type="button"
                onClick={disabled ? undefined : onClose}
                className={`chat-input__close-button${disabled ? ' chat-input__close-button--disabled' : ''}`}
                aria-label="Close chat"
                tabIndex={disabled ? -1 : 0}
            >
                <CloseIcon />
            </button>
        </div>
    );
}

ChatInput.propTypes = {
    onSendMessage: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    primaryColor: PropTypes.string
};

export default ChatInput;