import { useEffect, useRef, useLayoutEffect, useMemo, useCallback } from 'react';
import { useGemini } from '../../providers/GeminiProvider';
import { useRecoilValue, useRecoilState } from 'recoil';
import chatHistoryState from '../../atoms/chatHistoryState';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatWindow.scss';
import primaryColorState from '../../atoms/primaryColorState';
import apiKeyState from '../../atoms/apiKeyState';
import ChatSearchResults from './components/ChatSearchResults/ChatSearchResults';

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
    5. Use multiple parallel searches when logical (search for "cafe", "kitchen", "canteen" simultaneously)
    
    SYSTEMATIC PROPERTY FILTERING PROTOCOL:
    When a user requests a room with specific requirements (capacity, availability, equipment), you MUST follow this exact process:
    
    1. FIRST: Perform a broad search to get ALL relevant rooms (use both categories and locationTypes)
    2. THEN: Systematically scan EVERY returned room for the requested property
    3. IMMEDIATELY: Present the specific rooms that match, do NOT ask for additional criteria first
    
    CRITICAL DATA PROCESSING RULES:
    - When you receive search results, you get a JSON array of room objects
    - Each room has: name, floor, floorName, type, fields (object), description
    - The "fields" object contains custom properties like capacity, equipment, bookingState
    - You MUST examine the fields object for EVERY room in the results
    - NEVER claim "data not available" when it exists in the fields or description
    - If you see the data in the JSON, you MUST process and report it
    
    CAPACITY PROCESSING:
    For capacity requests ("room for X people", "seats Y", "fits Z"):
    
    MANDATORY STEP-BY-STEP PROCESS:
    1. Get the search results (you will receive a JSON array of rooms)
    2. FOR EACH room in the results, examine BOTH: "fields.capacity" AND "description" text
    3. Extract numbers from patterns: "seats 4", "4 People", "capacity 6", "accommodates 8"
    4. Compare extracted capacity with requested capacity
    5. IMMEDIATELY list rooms that meet or exceed the capacity - do NOT say "unable to determine"
    
    EXAMPLE DATA PROCESSING:
    If you see: {"name": "Ocean's Twelve", "fields": {"capacity": "4 People"}}
    And user asks: "room for 4 people"
    You MUST respond: "I found Ocean's Twelve (Floor 1, seats 4)"
    
    NEVER say "I cannot determine capacity" when the data is in fields.capacity or description.
    
    - Response format: "I found X rooms for Y+ people: RoomName1 (Floor Z, seats W), RoomName2 (Floor A, seats B)"
    - NEVER say "I found several rooms" without listing specific names and capacities
    
    AVAILABILITY PROCESSING:
    For availability requests ("available room", "free room", "not booked"):
    - Check fields for: bookingState, availability, status, occupied
    - Normalize values: "avaliable"→"Available", "FREE"→"Free", "AVAILABLE"→"Available"
    - Look for: "Free", "Available", "Open", "Vacant" (positive indicators)
    - Exclude: "Booked", "Occupied", "Reserved", "Busy" (negative indicators)
    - Response format: "I found X available rooms: RoomName1 (Floor Y, status: Free), RoomName2 (Floor Z, status: Available)"
    
    EQUIPMENT PROCESSING:
    For equipment requests ("room with TV", "whiteboard", "Zoom", "projector"):
    
    MANDATORY STEP-BY-STEP PROCESS:
    1. Get the search results (you will receive a JSON array of rooms)
    2. FOR EACH room in the results, examine the "fields" object
    3. Look specifically for these field keys: "equipment", "amenities", "features", "facilities"
    4. Also check "description" text for equipment mentions
    5. Extract equipment values and match against the request
    6. IMMEDIATELY list rooms that match - do NOT say "unable to filter"
    
    EXAMPLE DATA PROCESSING:
    If you see: {"name": "Ocean's Twelve", "fields": {"equipment": "TV"}}
    And user asks: "room with TV"
    You MUST respond: "I found Ocean's Twelve (Floor 1) which has a TV"
    
    NEVER say "I cannot filter" or "details not available" when the data is in the fields object.
    
    - Normalize equipment names: "tv"→"TV", "zoom"→"Zoom", "whiteboard"→"Whiteboard"
    - Common equipment: TV, Projector, Whiteboard, Zoom, Teams, Google Meet, Screen, Monitor
    - Response format: "I found X rooms with Y: RoomName1 (Floor Z, has: TV, Whiteboard), RoomName2 (Floor A, has: Zoom)"
    
    FOOD & DINING EXPLORATION:
    For food-related queries ("What can I eat?", "food options", "cafe"):
    - Try multiple searches: categories like "Canteen", types like "Kitchen", "Cafe", "Coffee_machine"
    - If no direct matches, search for related terms: "restaurant", "dining", "break room"
    - Present what you find, even if limited: "I found a Kitchen on Floor 2 and 3 Coffee machines on Floor 1"
    
    RESPONSE RULES:
    - BE PROACTIVE: Explore first, ask questions later
    - NEVER ask for additional criteria before presenting matches for capacity/availability/equipment
    - ALWAYS list specific room names with relevant details (floor, capacity, status, equipment)
    - If no rooms match the criteria, say "No rooms found with [specific requirement]" and suggest alternatives
    - For broad queries, categorize results: "On Floor 1, I found: 2 meeting rooms (Mean Girls, Wolf of Wall Street), 6 stairs, 3 offices, 1 storage room"
    - Only ask follow-up questions AFTER presenting the matching rooms/locations
    
    EXAMPLE RESPONSES:
    User: "What's on floor 1?" → "On Floor 1, I found: 2 meeting rooms (Mean Girls - Medium, Wolf of Wall Street - Small), 6 stairwells, 3 office spaces, 1 storage room, and 1 utility room. Would you like details about any specific type?"
    User: "room for 4 people" → "I found 2 rooms for 4+ people: Ocean's Twelve (Floor 1, seats 4), E.T. (Floor 1, seats 4)"
    User: "What food is available?" → "I found a Kitchen on Floor 2 and 3 Coffee machines (Floor 1, Floor 3, Floor 4). No cafes or restaurants were found in this building."
    
    If the user asks for a name, that could be of a person or a meeting room. If unable to find the meeting room, try to find the person using the location type "Workstation Booked" looking for the first name only, and then filter the results by the best match.`,
    'MapsIndoors Limitations': `You are not able to show wayfinding or routing on the map. You are not able to book meeting rooms. You have the users location. It is specifically the location My Location which can be searched for. You are not able to search the web or use other sources than what is available through the MCP tools.
    If the data is available on the location type or on the location properties, you can find available meeting rooms, equipment, and other properties of a location by looking through the properties of the location.`,
    'Response': `Respond in a helpful tone that aims to guide the user to find what they are looking for. If the user query is unclear ask follow up questions to identify the missing information. NEVER respond with a latitude or longitude or Location ID or External ID for a location unless asked to. When refering to 1 to 3 locations, respond with a location name when refering to the location. If the query response contains more than 3 results, mention the total number of locations found, but do not list all of them unless asked. If asked to perform an action outside of the available tools, inform the user that you are unable to do so. When refering to a floor, use the floor NAME in user-facing text, but when CALLING TOOLS convert the name to the correct floor index using floorIndexNames.
    Ask follow-up questions ONLY after: (1) solution context is loaded; (2) the broad search (category + MeetingRoom* locationTypes) has been performed when no floor/building is specified; and (3) property-based filtering has been attempted. If still zero results, propose close alternatives or request additional constraints (e.g., floor or capacity).
    
    Grounding and tool-result rules:
    - Treat the latest MCP tool outputs as authoritative. If a tool returns results, your answer MUST use them. Do NOT claim "not found" if a prior tool call returned items.
    - For follow‑ups, reuse previously fetched tool results (origin, destination, candidate sets) unless the user changes constraints. Do not discard or ignore prior tool outputs.
    - If structuredContent exists, base your answer strictly on it. If only JSON-in-text exists, parse it and use the parsed JSON. Never invent values not present in tool output.
    - If any required piece is missing (e.g., origin, destination, route), CALL THE TOOL to fetch it. Do not answer until all required tool outputs are present.
    - For "closest" or routing questions, only choose destinations from the previously filtered candidate set (property- or category/types-based).
    - Never contradict tool outputs. If tool data and model priors disagree, tool data wins.
    
    <DIRECTIONS>
      When a user asks about distance, travel time, or how to walk between two named locations, do not answer from search alone.
    
      Preconditions (must do before routing):
      - Ensure solution context is loaded (floorIndexNames and venues with graphId).
      - Resolve BOTH the origin and destination with "search_locations".
        - Pick exact name match if available; otherwise the top result.
        - Use the latitude, longitude, and floor from the chosen search result EXACTLY as-is for tool calls (do not guess, round, or transform). Use the numeric floor index from the result's "floor".
        - Never use user-typed lat/lon; never convert floor NAME to index for the tool if you already have a numeric floor from the search result.
    
      Venue and graph validation (must pass):
      - The origin and destination must have the same "venue". If venues differ, say routing is only available within the same venue and stop.
      - Use the "graphId" for that venue from the solution context. This "graphId" MUST be used with the "get_directions" call.
    
      Tool selection and parameters:
      - Call "get_directions" with:
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
        2) Guidance: 3–6 short steps using meaningful landmarks (avoid "Unknown", "Void", UUID-like names). Merge micro-steps (< 3 m), collapse repetitive "slightly left/right" into "bear left/right". Prefer "turn right at {LANDMARK}", "bear left along {WING/CORRIDOR}", "continue {N} m". End with "Then you'll reach {DESTINATION_NAME}. NEVER use bulletpoints, write full sentences."
    
      Closest selection workflow (unchanged intent, apply the rules above when routing):
      - If user asks for the closest room and provides an origin name:
        1) Resolve the origin with "search_locations".
        2) Ensure same venue for all candidates.
        3) Compute straight-line distances from the origin to candidates; take top 3.
        4) Call "get_directions" for each top candidate using the EXACT lat,lon,floor from search results and the correct venue graphId; prefer lowest duration, break ties by distance.
        5) Respond with the single best option.
      - If no origin name, ask if it's either:
        - "My Location" (use the user's current lat,lon,floor as origin). Can be found by searching for My Location.
        - "My Team" (Use the location of the specific location My Team, resolved via "search_locations").
        - "My Desk" (Use the location of the specific location My Desk, resolved via "search_locations").
    
      Guardrails:
      - Never output raw JSON. Return a clean, human-readable answer.
      - Never show lat/lon, Location ID, or External ID unless asked.
      - When mentioning floors to the user, use floor NAME; when calling tools, use floor INDEX.
      - Exclude landmarks named "Unknown", "Void" or similar; keep meaningful names.
    </DIRECTIONS>`,
};

function ChatWindow({ message, isEnabled, onMinimize, onSearchResults, locationHandlerRef, hoveredLocation, onShowRoute }) {
    const primaryColor = useRecoilValue(primaryColorState);
    const apiKey = useRecoilValue(apiKeyState);
    const chatWindowRef = useRef(null);
    const chatMessagesRef = useRef(null);

    // TODO: Hide header for now, redesign later
    const isHeaderVisible = false;

    // Use Gemini provider
    const { generateResponse, isLoading, tools, searchResults, directionsLocationIds } = useGemini();
    
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
            setChatHistory(prev => {
                const updatedMessages = [...prev];
                // Find the last server message and update it with locations
                for (let i = updatedMessages.length - 1; i >= 0; i--) {
                    if (updatedMessages[i].type === 'server') {
                        updatedMessages[i] = {
                            ...updatedMessages[i],
                            locations: validLocations
                        };
                        break;
                    }
                }
                return updatedMessages;
            });
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

            // Update the latest server message with directions location IDs
            setChatHistory(prev => {
                const updatedMessages = [...prev];
                // Find the last server message and update it with directions location IDs
                for (let i = updatedMessages.length - 1; i >= 0; i--) {
                    if (updatedMessages[i].type === 'server') {
                        updatedMessages[i] = {
                            ...updatedMessages[i],
                            directionsLocationIds: directionsLocationIds
                        };
                        break;
                    }
                }
                return updatedMessages;
            });
        }
    }, [directionsLocationIds]);

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
            
            // For server messages, add a delayed scroll to catch async content
            if (isLastMessageServer) {
                setTimeout(scrollToBottom, 300);
            }
            
            // Watch for content size changes (e.g., when ChatSearchResults renders)
            const resizeObserver = new ResizeObserver(() => {
                scrollToBottom();
            });
            
            resizeObserver.observe(container);
            
            return () => resizeObserver.disconnect();
        }
    }, [chatHistory, isLoading]);

    // Maybe expose a function to add messages, like onUserMessage, then pass it from the Search to the ChatWindow

    // Memoize message processing to prevent unnecessary re-renders
    const processMessage = useCallback(async (messageText) => {
        const userMessage = {
            id: Date.now(),
            text: messageText,
            type: 'user'
        };
        setChatHistory(prev => [...prev, userMessage]);

        // Call Gemini service for response (provider API expects an object)
        try {
            const response = await generateResponse(apiKey, messageText, PROMPT_FIELDS, tools);
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
    }, [generateResponse, apiKey]);

    // Handle new message from parent component
    useEffect(() => {
        if (!message?.trim()) return;
        processMessage(message.trim());
    }, [message, processMessage]);

    /**
     * Memoized chat messages to prevent unnecessary re-renders.
     * Only recalculates when chatHistory changes.
     */
    const chatMessages = useMemo(() => {
        return chatHistory.map((message, index) => {
            const isLastMessage = index === chatHistory.length - 1;
            const messageDirections = message.directionsLocationIds || (isLastMessage ? directionsLocationIds : null);
            const canShowRoute = messageDirections?.originLocationId && messageDirections?.destinationLocationId;

            return (
                <div key={message.id} className={`chat-window__message chat-window__message--${message.type}`}>
                    {message.type === 'server' ? (
                        <>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.text}
                            </ReactMarkdown>
                            {message.locations && message.locations.length > 0 && (
                                <ChatSearchResults
                                    locations={message.locations}
                                    locationHandlerRef={locationHandlerRef}
                                    hoveredLocation={hoveredLocation}
                                />
                            )}
                            {canShowRoute && (
                                <div className="chat-window__directions-button">
                                    <button
                                        type="button"
                                        className="chat-window__show-route-button"
                                        style={{ backgroundColor: primaryColor }}
                                        onClick={() => onShowRoute && onShowRoute(messageDirections)}
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
    }, [chatHistory]);

    // Keep chat visible if there are messages, even when parent disables visibility
    // Only show the chat window if there are messages
    // This might need to be a bit tweaked
    if (!isEnabled || chatHistory.length === 0) return null;

    return (
        <div ref={chatWindowRef} className="chat-window" style={{ '--chat-window-primary-color': primaryColor }}>
            {isHeaderVisible && <div className="chat-window__header">
                <span className="chat-window__title">Maps Indoors AI Assistant</span>
                <button
                    className="chat-window__minimize-button"
                    onClick={onMinimize}
                    type="button"
                    aria-label="Minimize chat"
                >
                    −
                </button>
            </div>}
            <div ref={chatMessagesRef} className="chat-window__messages">
                {chatMessages}
                {isLoading && (
                    <div className="chat-window__message chat-window__message--loading">
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span className="loading-dot"></span>
                        <span className="thinking-text">Thinking</span>
                    </div>
                )}
            </div>
        </div>
    );
}

ChatWindow.propTypes = {
    message: PropTypes.string,
    isEnabled: PropTypes.bool,
    onMinimize: PropTypes.func,
    onSearchResults: PropTypes.func,
    locationHandlerRef: PropTypes.object,
    hoveredLocation: PropTypes.object,
    onShowRoute: PropTypes.func
};

export default ChatWindow;
