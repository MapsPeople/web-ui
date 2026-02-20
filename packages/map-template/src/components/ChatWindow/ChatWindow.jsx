import { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react';
import { useGemini } from '../../providers/GeminiProvider';
import { useRecoilValue, useRecoilState } from 'recoil';
import chatHistoryState from '../../atoms/chatHistoryState';
import { useInitialChatMessage } from '../../hooks/useInitialChatMessage';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight';
import PropTypes from 'prop-types';
import './ChatWindow.scss';
import primaryColorState from '../../atoms/primaryColorState';
import apiKeyState from '../../atoms/apiKeyState';
import userPositionState from '../../atoms/userPositionState';
import currentVenueNameState from '../../atoms/currentVenueNameState';
import mapsIndoorsInstanceState from '../../atoms/mapsIndoorsInstanceState';
import userLocationShareState from '../../atoms/userLocationShareState';
import ChatMessages from './ChatMessages/ChatMessages';
import ChatInput from './ChatInput/ChatInput';
import LocationConsentPopup from './LocationConsentPopup/LocationConsentPopup';

/**
 * Updates the latest server message in the messages array with the provided updates.
 * 
 * @param {Array} messages - The array of message objects
 * @param {Object} updates - The properties to update on the latest server message
 * @returns {Array} A new array with the updated message
 */
function updateLatestServerMessage(messages, updates) {
    const updatedMessages = [...messages];
    // Find last server message index using reverse loop (ES5 compatible)
    let lastServerIndex = -1;
    for (let i = updatedMessages.length - 1; i >= 0; i--) {
        if (updatedMessages[i].type === 'server') {
            lastServerIndex = i;
            break;
        }
    }

    if (lastServerIndex !== -1) {
        updatedMessages[lastServerIndex] = {
            ...updatedMessages[lastServerIndex],
            ...updates
        };
    }

    return updatedMessages;
}

function ChatWindow({ isVisible, onClose, onSearchResults, onShowRoute }) {
    const primaryColor = useRecoilValue(primaryColorState);
    const apiKey = useRecoilValue(apiKeyState);
    const userPosition = useRecoilValue(userPositionState);
    const currentVenueName = useRecoilValue(currentVenueNameState);
    const mapsIndoorsInstance = useRecoilValue(mapsIndoorsInstanceState);
    const isDesktop = useIsDesktop();
    const chatWindowRef = useRef(null);
    const { getInitialMessage, clearInitialMessage } = useInitialChatMessage();
    const [isAnimated, setIsAnimated] = useState(false);
    const keyboardHeight = useKeyboardHeight(isDesktop);
    const isMobileKeyboardVisible = keyboardHeight > 0;


    // Use Gemini provider
    const { generateResponse, isLoading, searchResults, directionsLocationIds } = useGemini();

    // Use Recoil for chat history
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);

    // Location sharing consent state
    const [locationShareConsent, setLocationShareConsent] = useRecoilState(userLocationShareState);

    // Pending message waiting for consent decision
    const [pendingMessage, setPendingMessage] = useState(null);

    // Track the current thought during streaming
    const [currentThought, setCurrentThought] = useState('');

    // Keep responseId ref for streaming support - allows updating message text and metadata
    // as chunks arrive if we add progressive text streaming in the future
    const currentResponseIdRef = useRef(null);

    // Show consent popup when user position is available and consent hasn't been decided
    const shouldShowConsentPopup = userPosition && locationShareConsent === null && pendingMessage !== null;

    const handleConsentAccept = useCallback(() => {
        setLocationShareConsent('granted');
    }, [setLocationShareConsent]);

    const handleConsentDecline = useCallback(() => {
        setLocationShareConsent('denied');
    }, [setLocationShareConsent]);

    // Memoize the fetch locations function to prevent recreation on every render
    const fetchLocationsAndUpdateMessage = useCallback(async (searchResultIds) => {
        try {
            console.log('ChatWindow: Fetching full location objects for IDs:', searchResultIds);
            const promises = searchResultIds.map(id =>
                window.mapsindoors.services.LocationsService.getLocation(id)
            );
            const results = await Promise.allSettled(promises);
            const validLocations = results
                .filter(result => result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value);
            console.log('ChatWindow: Successfully fetched locations:', validLocations);

            // Update the latest server message with location data
            setChatHistory(prev => updateLatestServerMessage(prev, { locations: validLocations }));
        } catch (error) {
            console.error('ChatWindow: Error fetching locations by IDs:', error);
        }
    }, []);

    // Listen for search results from Gemini provider
    useEffect(() => {
        // Always notify parent of search results changes (including empty arrays to clear highlights)
        if (onSearchResults) {
            onSearchResults(searchResults);
        }

        // Only fetch location details if we have results
        if (searchResults && searchResults.length > 0) {
            console.log('ChatWindow: Received search results from provider:', searchResults);
            fetchLocationsAndUpdateMessage(searchResults);
        }
    }, [searchResults, onSearchResults, fetchLocationsAndUpdateMessage]);

    // Listen for directions location IDs from Gemini provider
    useEffect(() => {
        if (directionsLocationIds && directionsLocationIds.originLocationId && directionsLocationIds.destinationLocationId) {
            console.log('ChatWindow: Received directions location IDs from provider:', directionsLocationIds);

            // Update the latest server message with directions location IDs and route info
            setChatHistory(prev => updateLatestServerMessage(prev, {
                directionsLocationIds: directionsLocationIds,
                canShowRoute: true,
                routeDirections: directionsLocationIds
            }));
        }
    }, [directionsLocationIds]);



    // Handle sending messages
    // messageText is required - from the ChatInput component
    const handleSendMessage = useCallback(async (messageText) => {
        const trimmedMessage = messageText.trim();

        if (!trimmedMessage || isLoading) return;

        // If user position is available but consent hasn't been decided, wait for consent
        if (userPosition && locationShareConsent === null) {
            setPendingMessage(trimmedMessage);
            return;
        }

        const userMessage = {
            id: crypto.randomUUID(),
            text: trimmedMessage,
            type: 'user'
        };
        setChatHistory(prev => [...prev, userMessage]);

        // Build extra context object
        const extra = {};

        // Add user position and timezone if available and consent is granted
        if (userPosition && locationShareConsent === 'granted') {
            extra.userPosition = {
                latitude: userPosition.coords.latitude,
                longitude: userPosition.coords.longitude,
                floor: userPosition.floorIndex?.toString()
            };
            extra.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }

        // Add venue info if available
        if (currentVenueName) {
            extra.venue = {
                name: currentVenueName
            };
        }

        // Call Gemini service for response with extra context and streaming callbacks
        try {
            const responseId = crypto.randomUUID();
            currentResponseIdRef.current = responseId;
            setCurrentThought(''); // Reset current thought when starting a new message

            // Add placeholder message for streaming
            setChatHistory(prev => [
                ...prev,
                {
                    id: responseId,
                    text: '',
                    type: 'server',
                    locations: [],
                    directionsLocationIds: null
                }
            ]);

            // Call with streaming callbacks
            await generateResponse(apiKey, trimmedMessage, {
                extra,
                onChunk: (text) => {
                    const currentMessageId = currentResponseIdRef.current;
                    setChatHistory(prev => {
                        const updatedHistory = [...prev];
                        const messageIndex = updatedHistory.findIndex(m => m.id === currentMessageId);
                        if (messageIndex >= 0) {
                            updatedHistory[messageIndex] = {
                                ...updatedHistory[messageIndex],
                                text: (updatedHistory[messageIndex].text || '') + text
                            };
                        }
                        return updatedHistory;
                    });
                },
                onThought: (thoughtText) => {
                    // Update UI with current thought
                    setCurrentThought(thoughtText);
                },
                onComplete: () => {
                    // Streaming complete - function data is already processed by provider
                    currentResponseIdRef.current = null;
                }
            });
        } catch (error) {
            setChatHistory(prev => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    text: 'Sorry, I encountered an error processing your request.',
                    type: 'server',
                    locations: []
                }
            ]);
            setCurrentThought('');
        }
    }, [isLoading, generateResponse, apiKey, userPosition, currentVenueName, mapsIndoorsInstance, locationShareConsent]);

    // Send pending message after consent is decided
    useEffect(() => {
        if (pendingMessage && locationShareConsent !== null) {
            const messageToSend = pendingMessage;
            setPendingMessage(null);
            handleSendMessage(messageToSend);
        }
    }, [locationShareConsent, pendingMessage, handleSendMessage]);


    // Automatically send initial message when chat opens with a message from search
    // This is used to send the initial message from the search field when the chat window opens
    useEffect(() => {
        if (isVisible && !isLoading) {
            const initialMessage = getInitialMessage();

            if (initialMessage && initialMessage.trim()) {
                const messageText = initialMessage.trim();
                clearInitialMessage();
                handleSendMessage(messageText);
            }
        }
    }, [isVisible, isLoading, getInitialMessage, clearInitialMessage, handleSendMessage]);

    // Animate the chat window when it becomes visible on mobile
    useLayoutEffect(() => {
        if (!isDesktop && isVisible) {
            setIsAnimated(true);
        } else {
            setIsAnimated(false);
        }
    }, [isVisible, isDesktop]);


    /**
     * Get the layout classes for the ChatWindow component based on current state
     * 
     * @returns {string} Space-separated class names
     * 
     * Desktop: Returns 'chat-window desktop'
     * Mobile without keyboard: Returns 'chat-window mobile' (with 'chat-window--visible' when animated)
     * Mobile with keyboard: Returns 'chat-window mobile chat-window--keyboard-visible' (with 'chat-window--visible' when animated)
     */
    function getChatWindowLayout() {
        const baseClass = 'chat-window';

        // Desktop layout - no keyboard handling needed
        if (isDesktop) {
            return `${baseClass} desktop`;
        }

        // Mobile layout with keyboard visible - adds modifier class for positioning
        if (isMobileKeyboardVisible) {
            return `${baseClass} mobile chat-window--keyboard-visible${isAnimated ? ' chat-window--visible' : ''}`;
        }

        // Mobile layout without keyboard - default position at bottom with animation
        return `${baseClass} mobile${isAnimated ? ' chat-window--visible' : ''}`;
    }

    /**
     * Get inline styles for the ChatWindow component based on current state
     * 
     * @returns {Object} Style object with CSS custom properties
     * 
     * Always includes: '--chat-window-primary-color'
     * Mobile with keyboard: Also includes '--keyboard-height'
     */
    function getChatWindowStyles() {
        const baseStyles = {
            '--chat-window-primary-color': primaryColor
        };

        // Add keyboard height for mobile when keyboard is visible
        if (!isDesktop && isMobileKeyboardVisible) {
            return {
                ...baseStyles,
                '--keyboard-height': `${keyboardHeight}px`
            };
        }

        return baseStyles;
    }

    // Only show the chat window if it's visible
    if (!isVisible) return null;

    return (
        <div ref={chatWindowRef} className={getChatWindowLayout()} style={getChatWindowStyles()}>
            <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onClose={onClose}
            />
            {shouldShowConsentPopup && (
                <LocationConsentPopup
                    onAccept={handleConsentAccept}
                    onDecline={handleConsentDecline}
                />
            )}
            <ChatMessages
                chatHistory={chatHistory.filter(message => message.type !== 'server' || message.text)} // Filter out empty server messages
                isLoading={isLoading}
                primaryColor={primaryColor}
                onShowRoute={onShowRoute}
                currentThought={currentThought}
            />
        </div>
    );
}

ChatWindow.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSearchResults: PropTypes.func,
    onShowRoute: PropTypes.func
};

export default ChatWindow;
