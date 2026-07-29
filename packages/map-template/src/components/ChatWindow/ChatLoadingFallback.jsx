import './ChatLoadingFallback.scss';

function ChatLoadingFallback() {
    return (
        <div className="chat-loading-fallback" role="status" aria-label="Loading chat">
            <div className="chat-loading-fallback__spinner" />
        </div>
    );
}

export default ChatLoadingFallback;
