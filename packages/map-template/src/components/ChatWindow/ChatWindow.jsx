import { useEffect, useRef, useCallback, useState } from 'react';
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
import venuesInSolutionState from '../../atoms/venuesInSolutionState';
import userLocationShareState from '../../atoms/userLocationShareState';
import ChatMessages from './ChatMessages/ChatMessages';
import ChatInput from './ChatInput/ChatInput';
import LocationConsentPopup from './LocationConsentPopup/LocationConsentPopup';
import UsageConsentOverlay from './UsageConsentOverlay/UsageConsentOverlay';
import { useTranslation } from 'react-i18next';


function ChatWindow({ isVisible, onClose, onSearchResults, onShowRoute }) {
    const { t } = useTranslation();
    const primaryColor = useRecoilValue(primaryColorState);
    const apiKey = useRecoilValue(apiKeyState);
    const userPosition = useRecoilValue(userPositionState);
    const currentVenueName = useRecoilValue(currentVenueNameState);
    const venuesInSolution = useRecoilValue(venuesInSolutionState);
    const isDesktop = useIsDesktop();
    const chatWindowRef = useRef(null);
    const { getInitialMessage, clearInitialMessage } = useInitialChatMessage();
    const keyboardHeight = useKeyboardHeight(isDesktop);
    const isMobileKeyboardVisible = keyboardHeight > 0;

    // Use Gemini provider
    const { generateResponse, isLoading } = useGemini();

    // Use Recoil for chat history
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);

    // Location sharing consent state
    const [locationShareConsent, setLocationShareConsent] = useRecoilState(userLocationShareState);

    // Persisted in sessionStorage to survive navigation-triggered remounts; intentionally separate from the cookie banner.
    const [usageConsentAccepted, setUsageConsentAccepted] = useState(
        () => sessionStorage.getItem('chatUsageConsentAccepted') === 'true'
    );

    // Pending message waiting for consent decision
    const [pendingMessage, setPendingMessage] = useState(null);

    // Track the current thought during streaming
    const [currentThought, setCurrentThought] = useState('');

    // Deferred animation state: starts false, becomes true after isVisible so off-screen state is painted
    const [isAnimated, setIsAnimated] = useState(false);

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

    const handleDisclaimerAccept = useCallback(() => {
        sessionStorage.setItem('chatUsageConsentAccepted', 'true');
        setUsageConsentAccepted(true);
    }, [setUsageConsentAccepted]);

    const fetchLocationsAndUpdateMessage = useCallback(async (searchResultIds, messageId) => {
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

            setChatHistory(prev => {
                const updatedHistory = [...prev];
                const messageIndex = updatedHistory.findIndex(m => m.id === messageId);
                if (messageIndex >= 0) {
                    updatedHistory[messageIndex] = { ...updatedHistory[messageIndex], locations: validLocations };
                }
                return updatedHistory;
            });
            return validLocations;
        } catch (error) {
            console.error('ChatWindow: Error fetching locations by IDs:', error);
            return [];
        }
    }, []);

    // Handle sending messages
    // messageText is required - from the ChatInput component
    const handleSendMessage = useCallback(async (messageText) => {
        const trimmedMessage = messageText.trim();

        // Block all messages until usage consent is accepted
        if (!usageConsentAccepted) return;

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
            const currentVenue = venuesInSolution.find(
                venue => venue.name.toLowerCase() === currentVenueName.toLowerCase()
            );

            extra.venue = {
                name: currentVenueName
            };

            if (currentVenue?.id) {
                extra.venue.venueId = currentVenue.id;
            }
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

            // Call with streaming callbacks to update the message as chunks arrive and to set the current thought
            // The provider will handle updating the message text and metadata as chunks arrive, and will call onComplete when done
            await generateResponse(apiKey, trimmedMessage, {
                extra,
                onUpdate: ({ text, isThought }) => {
                    if (isThought) {
                        // Update UI with current thought
                        setCurrentThought(text);
                    } else {
                        // Update message with response text
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
                    }
                },
                onComplete: (payload) => {
                    if (payload && payload.error) {
                        const currentMessageId = currentResponseIdRef.current;
                        setChatHistory(prev => {
                            const updatedHistory = [...prev];
                            const messageIndex = updatedHistory.findIndex(m => m.id === currentMessageId);
                            if (messageIndex >= 0) {
                                updatedHistory[messageIndex] = {
                                    ...updatedHistory[messageIndex],
                                    text: payload.response || 'An error occurred',
                                    error: true
                                };
                            }
                            return updatedHistory;
                        });
                    } else if (payload) {
                        const { searchResultIds, directionsLocationIds, distanceResults } = payload;

                        if (directionsLocationIds || distanceResults?.length > 0) {
                            const messageUpdates = {};
                            if (directionsLocationIds) {
                                messageUpdates.directionsLocationIds = directionsLocationIds;
                                messageUpdates.canShowRoute = true;
                                messageUpdates.routeDirections = directionsLocationIds;
                            }
                            if (distanceResults?.length > 0) {
                                messageUpdates.distanceResults = distanceResults;
                            }
                            setChatHistory(prev => {
                                const history = [...prev];
                                const messageIndex = history.findIndex(m => m.id === responseId);
                                if (messageIndex >= 0) history[messageIndex] = { ...history[messageIndex], ...messageUpdates };
                                return history;
                            });
                        }

                        if (searchResultIds?.length > 0) {
                            fetchLocationsAndUpdateMessage(searchResultIds, responseId).then(locations => {
                                onSearchResults?.(locations);
                            });
                        } else {
                            onSearchResults?.([]);
                        }
                    }
                    setCurrentThought('');
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
    }, [isLoading, generateResponse, apiKey, userPosition, currentVenueName, venuesInSolution, locationShareConsent, usageConsentAccepted, onSearchResults, fetchLocationsAndUpdateMessage]);

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
        if (isVisible && !isLoading && usageConsentAccepted) {
            const initialMessage = getInitialMessage();

            if (initialMessage && initialMessage.trim()) {
                const messageText = initialMessage.trim();
                clearInitialMessage();
                handleSendMessage(messageText);
            }
        }
    }, [isVisible, isLoading, usageConsentAccepted, getInitialMessage, clearInitialMessage, handleSendMessage]);

    // Manage animation state for mobile: defer the animation class application so the off-screen state is painted first
    useEffect(() => {
        if (!isDesktop) {
            if (isVisible) {
                setIsAnimated(true);
            } else {
                setIsAnimated(false);
            }
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

        const consentBackdropClass = !usageConsentAccepted ? ' chat-window--consent' : '';

        // Desktop layout - no keyboard handling needed
        if (isDesktop) {
            return `${baseClass} desktop${consentBackdropClass}`;
        }

        // Mobile layout with keyboard visible - adds modifier class for positioning
        if (isMobileKeyboardVisible) {
            return `${baseClass} mobile chat-window--keyboard-visible${consentBackdropClass}${isAnimated ? ' chat-window--visible' : ''}`;
        }

        // Mobile layout without keyboard - default position at bottom with animation
        return `${baseClass} mobile${consentBackdropClass}${isAnimated ? ' chat-window--visible' : ''}`;
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
                disabled={!usageConsentAccepted}
                primaryColor={primaryColor}
            />
            {!usageConsentAccepted ? (
                <UsageConsentOverlay onAccept={handleDisclaimerAccept} onDecline={onClose} />
            ) : (
                <>
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
                </>
            )}
            <p className="chat-window__disclaimer">
                {t('AI disclaimer')}
            </p>
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
