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
import ChatMessages from './ChatMessages/ChatMessages';
import ChatInput from './ChatInput/ChatInput';

// Move prompt fields outside component to prevent recreation on every render
const PROMPT_FIELDS = {
    SystemContext:
        "You are an indoor spatial assistant using MapsIndoors developed by MapsPeople. You can answer questions about georeferenced indoor locations within the data that is available to you through the MCP tools.",
    Response: `
  ### TONE & INTERACTION
  Respond in a helpful, guiding tone. If a query is unclear, ask clarifying questions only AFTER searching for broad matches.
  - **Floors**: Use floor NAMES in user-facing text, but floor INDEXES for tool calls.
  - **Locations**: detailed list for up to 3 results; summary counts for more.
  - **Capabilities**: If an action is impossible with tools, politely decline.
  - **Privacy**: NEVER output Lat/Lon, Location ID, or External ID unless explicitly asked.

  ### GROUNDING & TOOL TRUTH
  - **Authoritative Data**: Tool outputs are the source of truth. If specific data exists in the tool output (JSON or text), use it. Do not halllucinate or rounds values unpredictably.
  - **Context**: Reuse previously fetched tool results for follow-up questions unless the user changes the constraints.
  - **Completeness**: If a required parameter (e.g., origin, destination) is missing, call the necessary tool to fetch it before answering.

  ### PROACTIVE EXPLORATION & RESPONSE PROTOCOL
  1. **Explore First**: On broad queries ("What's on floor 1?"), search immediately. Do not ask for clarification first.
  2. **Categorize**: For large result sets (>5 items), summarize by category (e.g., "I found 2 meeting rooms, 6 stairs, and 3 offices").
  3. **Specifics**: When filtering by property (capacity), ALWAYS list the specific matching location names and the relevant detail (e.g., "Ocean's Twelve (Seats 4)").
  4. **No Results**: If no matches are found, state "No locations found with [requirement]" and immediately propose the closest valid alternatives (e.g. same room type on a different floor).

  ### FOLLOW-UP STRATEGY
  Ask follow-up questions ONLY after:
  1. Solution context is loaded.
  2. Broad search (Category + Types) has been performed.
  3. Filtering has been attempted and returned zero results.

  ### EXAMPLE RESPONSES
  User: "What's on floor 1?" 
  Assistant: "On Floor 1, I found: 2 meeting rooms (Mean Girls - Medium, Wolf of Wall Street - Small), 6 stairwells, 3 office spaces. Would you like details on a specific type?"

  User: "room for 4 people" 
  Assistant: "I found 2 rooms for 4+ people: Ocean's Twelve (Floor 1, seats 4), E.T. (Floor 1, seats 4)"`,

    MapsIndoorsLimitations: `You are not able to show wayfinding or routing on the map. You are not able to book meeting rooms. You are not able to search the web or use other sources than what is available through the MCP tools.
If the data is available on the location type or on the location properties, you can find available meeting rooms and other properties of a location by looking through the properties of the location.`,
};

/**
 * Updates the latest server message in the messages array with the provided updates.
 * 
 * @param {Array} messages - The array of message objects
 * @param {Object} updates - The properties to update on the latest server message
 * @returns {Array} A new array with the updated message
 */
function updateLatestServerMessage(messages, updates) {
    const updatedMessages = [...messages];
    const lastServerIndex = updatedMessages.findLastIndex(msg => msg.type === 'server');

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


    // TODO: Hide header for now, redesign later
    const isHeaderVisible = false;

    // Use Gemini provider
    const { generateResponse, isLoading, searchResults, directionsLocationIds } = useGemini();

    // Use Recoil for chat history
    const [chatHistory, setChatHistory] = useRecoilState(chatHistoryState);

    // Memoize the fetch locations function to prevent recreation on every render
    const fetchLocationsAndUpdateMessage = useCallback(async (searchResultIds) => {
        try {
            console.log('ChatWindow: Fetching full location objects for IDs:', searchResultIds);
            const promises = searchResultIds.map(id =>
                window.mapsindoors.services.LocationsService.getLocation(id)
            );
            const locations = await Promise.all(promises);
            const validLocations = locations.filter(location => location !== null);
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

        const userMessage = {
            id: Date.now(),
            text: trimmedMessage,
            type: 'user'
        };
        setChatHistory(prev => [...prev, userMessage]);

        // Build extra context object
        const extra = {};

        // Add user position if available
        if (userPosition) {
            extra.userPosition = {
                latitude: userPosition.coords.latitude,
                longitude: userPosition.coords.longitude,
                floor: userPosition.floorIndex?.toString()
            };
        }

        // Add venue info if available
        if (currentVenueName) {
            extra.venue = {
                name: currentVenueName
            };
        }

        // Add timezone
        extra.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Call Gemini service for response with extra context
        try {
            const response = await generateResponse(apiKey, trimmedMessage, PROMPT_FIELDS, extra);
            setChatHistory(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: response,
                    type: 'server',
                    locations: [], // Will be populated by search results effect
                    directionsLocationIds: null // Will be populated by directions effect
                }
            ]);
        } catch (error) {
            setChatHistory(prev => [
                ...prev,
                {
                    id: Date.now() + 2,
                    text: 'Sorry, I encountered an error processing your request.',
                    type: 'server',
                    locations: []
                }
            ]);
        }
    }, [isLoading, generateResponse, apiKey, userPosition, currentVenueName, mapsIndoorsInstance]);


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
            {isHeaderVisible && <div className="chat-window__header">
                <span className="chat-window__title">Maps Indoors AI Assistant</span>
                <button
                    className="chat-window__minimize-button"
                    onClick={onClose}
                    type="button"
                    aria-label="Close chat"
                >
                    ×
                </button>
            </div>}
            <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                onClose={onClose}
            />
            <ChatMessages
                chatHistory={chatHistory}
                isLoading={isLoading}
                primaryColor={primaryColor}
                onShowRoute={onShowRoute}
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
