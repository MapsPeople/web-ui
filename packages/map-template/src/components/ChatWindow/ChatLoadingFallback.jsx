import { useTranslation } from 'react-i18next';
import './ChatLoadingFallback.scss';

function ChatLoadingFallback() {
    const { t } = useTranslation();

    return (
        <div className="chat-loading-fallback" role="status">
            <div className="chat-loading-fallback__spinner" />
            <span className="chat-loading-fallback__sr-only">{t('Loading chat')}</span>
        </div>
    );
}

export default ChatLoadingFallback;
