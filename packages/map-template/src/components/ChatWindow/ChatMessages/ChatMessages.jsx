import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';
import ChatSearchResults from '../ChatSearchResults/ChatSearchResults';
import './ChatMessages.scss';

// Number of top-level markdown nodes (paragraphs, headings, lists, etc.) to show in collapsed state.
const MAX_COLLAPSED_NODES = 1;

/**
 * Remark plugin that truncates the markdown AST to the first N top-level nodes.
 * Used to show a preview of long server messages without breaking markdown syntax.
 */
function remarkTruncate({ maxNodes = MAX_COLLAPSED_NODES } = {}) {
    return (tree) => {
        if (tree.children.length > maxNodes) {
            tree.children = tree.children.slice(0, maxNodes);
        }
    };
}

/**
 * Checks whether a markdown string contains more than MAX_COLLAPSED_NODES paragraph blocks.
 * Paragraphs in markdown are separated by double newlines.
 */
function hasMoreContent(text) {
    return text.split(/\n\n+/).filter(Boolean).length > MAX_COLLAPSED_NODES;
}

function ChatMessages({ chatHistory, isLoading, primaryColor, onShowRoute, currentThought }) {
    const chatMessagesRef = useRef(null);
    // Set of expanded message IDs — presence means expanded, absence means collapsed.
    const [expandedMessages, setExpandedMessages] = useState(new Set());

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

    const toggleMessageExpanded = useCallback((messageId) => {
        setExpandedMessages(prevExpandedMessages => {
            const nextExpandedMessages = new Set(prevExpandedMessages);
            if (nextExpandedMessages.has(messageId)) {
                nextExpandedMessages.delete(messageId);
            } else {
                nextExpandedMessages.add(messageId);
            }
            return nextExpandedMessages;
        });
    }, []);

    const chatMessages = chatHistory.map((message) => {
        const isExpanded = expandedMessages.has(message.id);
        const isTruncatable = message.type === 'server' && hasMoreContent(message.text);

        return (
            <div key={message.id} className={`chat-messages__message chat-messages__message--${message.type}`}>
                {message.type === 'server' ? (
                    <>
                        <ReactMarkdown remarkPlugins={isTruncatable && !isExpanded ? [remarkTruncate, remarkGfm] : [remarkGfm]}>
                            {message.text}
                        </ReactMarkdown>
                        {isTruncatable && (
                            <button
                                type="button"
                                className="chat-messages__toggle-expand"
                                onClick={() => toggleMessageExpanded(message.id)}
                            >
                                {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                        )}
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
                    <span className="chat-messages__thinking-text">
                        {currentThought || 'Thinking'}
                    </span>
                </div>
            )}
        </div>
    );
}

ChatMessages.propTypes = {
    chatHistory: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    primaryColor: PropTypes.string.isRequired,
    onShowRoute: PropTypes.func,
    currentThought: PropTypes.string
};

export default ChatMessages;

