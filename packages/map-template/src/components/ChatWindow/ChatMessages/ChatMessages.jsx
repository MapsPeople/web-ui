import { useRef, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';
import ChatSearchResults from '../ChatSearchResults/ChatSearchResults';
import './ChatMessages.scss';

function ChatMessages({ chatHistory, isLoading, primaryColor, onShowRoute }) {
    const chatMessagesRef = useRef(null);

    // Auto-scroll to bottom when messages change or loading state changes
    // Uses immediate scroll + 300ms delay for server messages + ResizeObserver for async content
    useLayoutEffect(() => {
        if (chatMessagesRef.current) {
            const container = chatMessagesRef.current;

            const scrollToBottom = () => {
                requestAnimationFrame(() => {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: 'smooth'
                    });
                });
            };

            // Check if the last message is a server message (which might have async content)
            const isLastMessageServer = chatHistory.length > 0 &&
                chatHistory[chatHistory.length - 1]?.type === 'server';

            // Initial scroll
            scrollToBottom();

            const delayedScrollId = isLastMessageServer
                ? setTimeout(scrollToBottom, 300)
                : null;

            // Watch for content size changes (e.g., when ChatSearchResults renders)
            const resizeObserver = new ResizeObserver(() => {
                scrollToBottom();
            });

            resizeObserver.observe(container);

            return () => {
                if (delayedScrollId) {
                    clearTimeout(delayedScrollId);
                }
                resizeObserver.disconnect();
            };
        }
    }, [chatHistory, isLoading]);

    /**
     * Render chat messages - purely presentational component.
     * All logic is handled by ChatWindow parent.
     */
    const chatMessages = chatHistory.map((message) => {
        return (
            <div key={message.id} className={`chat-messages__message chat-messages__message--${message.type}`}>
                {message.type === 'server' ? (
                    <>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.text}
                        </ReactMarkdown>
                        {message.locations && message.locations.length > 0 && (
                            <ChatSearchResults
                                locations={message.locations}
                            />
                        )}
                        {message.type === 'server' && message.canShowRoute && message.routeDirections && onShowRoute && (
                            <div className="chat-messages__directions-button">
                                <button
                                    type="button"
                                    className="chat-messages__show-route-button"
                                    style={{ backgroundColor: primaryColor }}
                                    onClick={() => onShowRoute && onShowRoute(message.routeDirections)}
                                >
                                    Show Route
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <span>{message.text}</span>
                )}
            </div>
        );
    });

    return (
        <div ref={chatMessagesRef} className="chat-messages">
            {chatMessages}
            {isLoading && (
                <div className="chat-messages__message chat-messages__message--loading">
                    <span className="chat-messages__loading-dot"></span>
                    <span className="chat-messages__loading-dot"></span>
                    <span className="chat-messages__loading-dot"></span>
                    <span className="chat-messages__thinking-text">Thinking</span>
                </div>
            )}
        </div>
    );
}

ChatMessages.propTypes = {
    chatHistory: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    primaryColor: PropTypes.string.isRequired,
    onShowRoute: PropTypes.func
};

export default ChatMessages;

