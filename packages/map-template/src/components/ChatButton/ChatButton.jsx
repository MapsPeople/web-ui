import { createPortal } from 'react-dom';
import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import chatHistoryState from '../../atoms/chatHistoryState';
import primaryColorState from '../../atoms/primaryColorState';
import {ReactComponent as ChatButtonIcon} from '../../assets/chat-icon.svg';
import { usePortalTarget } from '../../hooks/usePortalTarget';
import './ChatButton.scss';

ChatButton.propTypes = {
    pushAppView: PropTypes.func.isRequired,
    currentAppView: PropTypes.string,
    appViews: PropTypes.object.isRequired
};

/**
 * ChatButton component - A button that opens the chat window when there is chat history
 * Positioned in map controls using portal system
 */
function ChatButton({ pushAppView, currentAppView, appViews }) {
    const portalContainer = usePortalTarget('.chat-button-portal');
    const chatHistory = useRecoilValue(chatHistoryState);
    const primaryColor = useRecoilValue(primaryColorState);

    // Check if there is any chat history
    const hasChatHistory = chatHistory && chatHistory.length > 0;

    // Don't show button if chat is already open
    const isChatOpen = currentAppView === appViews.CHAT;

    /**
     * Opens the chat window by pushing the CHAT app view
     */
    function handleOpenChat() {
        pushAppView(appViews.CHAT);
    }

    // Early return if no chat history or chat is already open
    if (!hasChatHistory || isChatOpen) {
        return null;
    }

    if (!portalContainer) return null;

    return createPortal(
        <button 
            className="chat-button"
            onClick={handleOpenChat}
            title="Open chat"
            aria-label="Open chat"
            type="button"
            style={{ '--chat-button-primary-color': primaryColor }}
        >
            <ChatButtonIcon />
        </button>,
        portalContainer
    );
}

export default ChatButton;

