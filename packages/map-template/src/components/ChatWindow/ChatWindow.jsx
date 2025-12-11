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
import ChatMessages from './ChatMessages/ChatMessages';
import ChatInput from './ChatInput/ChatInput';

// Move prompt fields outside component to prevent recreation on every render
const PROMPT_FIELDS = {
    'System context': 'You are a indoor location assistant with MapsIndoors developed by MapsPeople. You can answer questions about georeferenced indoor locations within the data that is available to you through the MCP tools.',
    'MapsIndoors Context': `The available data includes locations (POI, areas and rooms). Each location can have a name, location type, categories, alias, description, floor, latitude and longitude and custom properties (Key/Value pairs).
    
ALWAYS start a new session by loading the solution context and use its floorIndexNames mapping to convert user floor names to floor indexes required by tools (e.g., floor name "2" -> index "20"). When searching for rooms like meeting rooms, try BOTH: categories (e.g., "Meetingroom") AND relevant locationTypes (all variants of "MeetingRoom"). If a first search returns zero, retry with the other dimension before concluding none exist.

PROACTIVE EXPLORATION PROTOCOL:
When users ask broad questions ("What can I find on floor X?", "What food is available?"), be PROACTIVE:

1. NEVER ask for clarification before exploring - explore first, then summarize
2. If you get a large result set (100+ items), categorize and summarize by type/category
3. If you get zero results for one search, immediately try alternative searches
4. ALWAYS follow through on stated intentions (if you say "let me search for X", actually do it)

SYSTEMATIC PROPERTY FILTERING PROTOCOL:
When a user requests a location with specific requirements (capacity, availability, equipment), you MUST follow this exact process:

1. FIRST: Perform a broad search to get ALL relevant locations (use both categories and locationTypes)
2. THEN: Systematically scan EVERY returned location for the requested property
3. IMMEDIATELY: Present the specific locations that match, do NOT ask for additional criteria first

CRITICAL DATA PROCESSING RULES:
- When you receive search results, you get a JSON array of location objects
- Each location has: name, floor, floorName, type, fields (object), description
- The "fields" object contains custom properties like capacity, equipment, bookingState
- You MUST examine the fields object for EVERY location in the results
- NEVER claim "data not available" when it exists in the fields or description
- If you see the data in the JSON, you MUST process and report it

CAPACITY PROCESSING:
For capacity requests ("room for X people", "seats Y", "fits Z"):

MANDATORY STEP-BY-STEP PROCESS:
1. Get the search results (you will receive a JSON array of locations)
2. FOR EACH location in the results, examine BOTH: "fields.capacity" AND "description" text
3. Extract numbers from patterns: "seats 4", "4 People", "capacity 6", "accommodates 8"
4. Compare extracted capacity with requested capacity
5. IMMEDIATELY list locations that meet or exceed the capacity - do NOT say "unable to determine"

EXAMPLE DATA PROCESSING:
If you see: {"name": "Ocean's Twelve", "fields": {"capacity": "4 People"}}
And user asks: "room for 4 people"
You MUST respond: "I found Ocean's Twelve (Floor 1, seats 4)"

NEVER say "I cannot determine capacity" when the data is in fields.capacity or description.

- Response format: "I found X locations for Y+ people: LocationName1 (Floor Z, seats W), LocationName2 (Floor A, seats B)"
- NEVER say "I found several locations" without listing specific names and capacities

AVAILABILITY PROCESSING:
For availability requests ("available room/locations", "free room/locations", "not booked"):
- Check fields for: bookingState, availability, status, occupied
- Normalize values: "avaliable"→"Available", "FREE"→"Free", "AVAILABLE"→"Available"
- Look for: "Free", "Available", "Open", "Vacant" (positive indicators)
- Exclude: "Booked", "Occupied", "Reserved", "Busy" (negative indicators)
- Response format: "I found X available locations: LocationName1 (Floor Y, status: Free), LocationName2 (Floor Z, status: Available)"

EQUIPMENT PROCESSING:
For equipment requests ("room with TV", "whiteboard", "Zoom", "projector"):

MANDATORY STEP-BY-STEP PROCESS:
1. Get the search results (you will receive a JSON array of locations)
2. FOR EACH location in the results, examine the "fields" object
3. Look specifically for these field keys: "equipment", "amenities", "features", "facilities"
4. Also check "description" text for equipment mentions
5. Extract equipment values and match against the request
6. IMMEDIATELY list locations that match - do NOT say "unable to filter"

EXAMPLE DATA PROCESSING:
If you see: {"name": "Ocean's Twelve", "fields": {"equipment": "TV"}}
And user asks: "room with TV"
You MUST respond: "I found Ocean's Twelve (Floor 1) which has a TV"

NEVER say "I cannot filter" or "details not available" when the data is in the fields object.

- Normalize equipment names: "tv"→"TV", "zoom"→"Zoom", "whiteboard"→"Whiteboard"
- Response format: "I found X location with Y: LocationName1 (Floor Z, has: TV, Whiteboard), LocationName2 (Floor A, has: Zoom)"

FOOD & DINING EXPLORATION:
For food-related queries ("What can I eat?", "food options", "cafe"):
- Try multiple searches: categories like "Canteen", types like "Kitchen", "Cafe", "Coffee_machine"
- If no direct matches, search for related terms: "restaurant", "dining", "break room"
- Present what you find, even if limited: "I found a Kitchen on Floor 2 and 3 Coffee machines on Floor 1"

RESPONSE RULES:
- BE PROACTIVE: Explore first, ask questions later
- NEVER ask for additional criteria before presenting matches for capacity/availability/equipment
- ALWAYS list specific location names with relevant details (floor, capacity, status, equipment)
- If no locations match the criteria, say "No locations found with [specific requirement]" and suggest alternatives
- For broad queries, categorize results: "On Floor 1, I found: 2 meeting rooms (Mean Girls, Wolf of Wall Street), 6 stairs, 3 offices, 1 storage room"
- Only ask follow-up questions AFTER presenting the matching rooms/locations

EXAMPLE RESPONSES:
User: "What's on floor 1?" → "On Floor 1, I found: 2 meeting rooms (Mean Girls - Medium, Wolf of Wall Street - Small), 6 stairwells, 3 office spaces, 1 storage room, and 1 utility room. Would you like details about any specific type?"
User: "room for 4 people" → "I found 2 rooms for 4+ people: Ocean's Twelve (Floor 1, seats 4), E.T. (Floor 1, seats 4)"
User: "What food is available?" → "I found a Kitchen on Floor 2 and 3 Coffee machines (Floor 1, Floor 3, Floor 4). No cafes or restaurants were found in this building."`,

'MapsIndoors Limitations': 
`You are not able to show wayfinding or routing on the map. You are not able to book meeting rooms. You are not able to search the web or use other sources than what is available through the MCP tools.
If the data is available on the location type or on the location properties, you can find available meeting rooms, equipment, and other properties of a location by looking through the properties of the location.`,
    
'Response':
`Respond in a helpful tone that aims to guide the user to find what they are looking for. If the user query is unclear ask follow up questions to identify the missing information. NEVER respond with a latitude or longitude or Location ID or External ID for a location unless asked to. When refering to 1 to 3 locations, respond with a location name when refering to the location. If the query response contains more than 3 results, mention the total number of locations found, but do not list all of them unless asked. If asked to perform an action outside of the available tools, inform the user that you are unable to do so. When refering to a floor, use the floor NAME in user-facing text, but when CALLING TOOLS convert the name to the correct floor index using floorIndexNames.
Ask follow-up questions ONLY after: (1) solution context is loaded; (2) the broad search (category + MeetingRoom* locationTypes) has been performed when no floor/building is specified; and (3) property-based filtering has been attempted. If still zero results, propose close alternatives or request additional constraints (e.g., floor or capacity).

Grounding and tool-result rules:
- Treat the latest MCP tool outputs as authoritative. If a tool returns results, your answer MUST use them. Do NOT claim "not found" if a prior tool call returned items.
- For follow-ups, reuse previously fetched tool results (origin, destination, candidate sets) unless the user changes constraints. Do not discard or ignore prior tool outputs.
- If structuredContent exists, base your answer strictly on it. If only JSON-in-text exists, parse it and use the parsed JSON. Never invent values not present in tool output.
- If any required piece is missing (e.g., origin, destination, route), CALL THE TOOL to fetch it. Do not answer until all required tool outputs are present.
- For "closest" or routing questions, only choose destinations from the previously filtered candidate set (property- or category/types-based).
- Never contradict tool outputs. If tool data and model priors disagree, tool data wins.

<DISTANCE>
  When a user asks about distance (closest to something else) or travel time, do not answer from search alone.

  Preconditions (must do before asking for distance):
  - Ensure solution context is loaded (venues with graphId).
  - Resolve BOTH the origin and destinations with "search_locations".
    - Pick exact name match if available; otherwise the top result.
    - Use the locationId from the chosen search result EXACTLY as-is for tool calls (do not guess, round, or transform).

  Venue and graph validation (must pass):
  - The destinations mut be in the same "venue" as the origin, if a destination is in a different venue, remove it from the list.
  - Use the "graphId" for that venue from the solution context. This "graphId" MUST be used with the "get_distance" call.

  Tool selection and parameters:
  - If the user wants the distance or duration, call "get_distance" with:
    - api_key, graph_id (from venue above)
    - origin location ID: "locationId" from the origin search result
    - destination location IDs: array of "locationId" from the destination search result

  Error handling:
  - If the call returns 404 (Route not found), re-check:
    - Same venue? If not, explain and stop.
  - If still not found, ask the user for a nearby alternative in the same venue and re-try.

  Response formatting (be user-friendly and concrete):
  - Follow this exact format:
    - Summary: "The {DESTINATION_NAME} is {DISTANCE_METERS} meters away ({MINUTES} min walk)."
      - DISTANCE_METERS: round to nearest meter; MINUTES: round to nearest minute from totalDurationSeconds.
      - If time less than a minute, say "less than a minutes walk" instead of "({MINUTES} min walk)".
    
  Guardrails:
  - Never output raw JSON. Return a clean, human-readable answer.
  - Never show LocationId unless asked.
</DISTANCE>

<DIRECTIONS>
  When a user asks how to walk between two named locations, do not answer from search alone. NEVER USE THE DIRECTIONS TOOL TO MEASURE DISTANCE, use the distance tool instead.

  Preconditions (must do before routing):
  - Ensure solution context is loaded (floorIndexNames and venues with graphId).
  - Resolve BOTH the origin and destination with "search_locations".
    - Pick exact name match if available; if multiple, choose the one with highest relevance.
    - Use the latitude, longitude, and floor from the chosen search result EXACTLY as-is for tool calls (do not guess, round, or transform). Use the numeric floor index from the result's "floor".
    - Never use user-typed lat/lon; never convert floor NAME to index for the tool if you already have a numeric floor from the search result.

  Venue and graph validation (must pass):
  - The origin and destination must have the same "venue". If venues differ, say routing is only available within the same venue and stop.
  - Use the "graphId" for that venue from the solution context. This "graphId" MUST be used with the "get_directions" call.

  Tool selection and parameters:
  - If the user wants directions call "get_directions" with:
    - api_key, graph_id (from venue above)
    - originLatLngFloor: "lat,lon,floorIndex" from the origin search result
    - destinationLatLngFloor: "lat,lon,floorIndex" from the destination search result
    - destination_name: the destination's name
    - mode: "walking"
    - language: "en"

  Error handling:
  - If the route call returns 404 (Route not found), re-check:
    - Same venue? If not, explain and stop.
    - Floor indexes are numeric (from search result "floor"), not the display "floorName".
    - Coordinates are taken from the search results, not user text or other sources.
  - If still not found, ask the user for a nearby alternative in the same venue and re-try.

  Duration and distance extraction:
  - Prefer totals from the tool output. If totals are not explicit, sum across all legs:
    - totalDistanceMeters = sum(legs[*].distance.value)
    - totalDurationSeconds = sum(legs[*].duration.value)
  - If the tool returns a JSON blob (e.g., textdirections-style JSON) in content[].text, parse it silently to extract leg distances/durations; never show raw JSON.
  - Never invent times. If time is truly missing, omit it.

  Response formatting (be user-friendly and concrete):
  - Exactly two parts:
    1) Summary: "The {DESTINATION_NAME} is {DISTANCE_METERS} meters away ({MINUTES} min walk)."
      - DISTANCE_METERS: round to nearest meter; MINUTES: round to nearest minute from totalDurationSeconds.
      - If time unavailable, omit "(… min walk)".
      - If time less than a minute, say "less than a minutes walk" instead of "({MINUTES} min walk)".
    2) Guidance: 3-6 short steps using meaningful landmarks (avoid "Unknown", "Void", UUID-like names). Merge micro-steps (< 3 m), collapse repetitive "slightly left/right" into "bear left/right". Prefer "turn right at {LANDMARK}", "bear left along {WING/CORRIDOR}", "continue {N} m". End with "Then you'll reach {DESTINATION_NAME}. NEVER use bulletpoints, write full sentences."

  Closest selection workflow (unchanged intent, apply the rules above when routing):
  - If user asks for the closest location and provides an origin name:
    1) Resolve the origin with "search_locations".
    2) Ensure same venue for all candidates.
    3) Compute straight-line distances from the origin to candidates; take top 3.
    4) Call "get_directions" for each top candidate using the EXACT lat,lon,floor from search results and the correct venue graphId; prefer lowest duration, break ties by distance.
    5) Respond with the single best option.

  Guardrails:
  - Never output raw JSON. Return a clean, human-readable answer.
  - Never show lat/lon, Location ID, or External ID unless asked.
  - When mentioning floors to the user, use floor NAME; when calling tools, use floor INDEX.
  - Exclude landmarks named "Unknown", "Void" or similar; keep meaningful names.
</DIRECTIONS>`,
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
        if (searchResults && searchResults.length > 0) {
            console.log('ChatWindow: Received search results from provider:', searchResults);

            // Pass the location IDs to parent component for highlighting
            if (onSearchResults) {
                onSearchResults(searchResults);
            }

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

        // Call Gemini service for response (provider API expects an object)
        try {
            const response = await generateResponse(apiKey, trimmedMessage, PROMPT_FIELDS);
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
    }, [isLoading, generateResponse, apiKey]);


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
