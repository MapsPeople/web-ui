import { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create the context
const GeminiContext = createContext();

// API base URL - can be configured via environment variable or defaults to localhost:4000
const API_BASE_URL = 'http://localhost:4000';

export function GeminiProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [directionsLocationIds, setDirectionsLocationIds] = useState(null);
    const defaultPrompt = '';

    // Store session info - using refs to track current session without causing re-renders
    const sessionIdRef = useRef(null);
    const currentApiKeyRef = useRef(null);
    const currentPromptFieldsRef = useRef(null);

    // Helper function to create or get session
    const ensureSession = useCallback(async (apiKey, promptFields) => {
        // Check if we need to create a new session
        const needsNewSession =
            !sessionIdRef.current ||
            currentApiKeyRef.current !== apiKey ||
            JSON.stringify(currentPromptFieldsRef.current) !== JSON.stringify(promptFields);

        if (needsNewSession) {
            // If we have an old session, clean it up first
            if (sessionIdRef.current) {
                try {
                    await fetch(`${API_BASE_URL}/api/chat/end/${sessionIdRef.current}`, {
                        method: 'DELETE'
                    });
                } catch (error) {
                    console.warn('Error ending previous session:', error);
                }
            }

            // Create new session
            const startRes = await fetch(`${API_BASE_URL}/api/chat/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey,
                    promptFields
                })
            });

            if (!startRes.ok) {
                const errorData = await startRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to create session: ${startRes.status}`);
            }

            const { sessionId } = await startRes.json();
            sessionIdRef.current = sessionId;
            currentApiKeyRef.current = apiKey;
            currentPromptFieldsRef.current = promptFields;
        }

        return sessionIdRef.current;
    }, []);

    // Wrapper function to generate a response using the Gemini service
    const generateResponseWrapper = useCallback(async (apiKey, prompt, promptFields, extra = {}) => {
        setIsLoading(true);
        // Clear previous directions data when starting a new request
        setDirectionsLocationIds(null);
        try {
            console.log('Generating response for prompt:', prompt);

            // Ensure we have a valid session
            const sessionId = await ensureSession(apiKey, promptFields);

            // Send message to the session with extra context
            const messageRes = await fetch(`${API_BASE_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    message: prompt,
                    extra: extra
                })
            });

            if (!messageRes.ok) {
                const errorData = await messageRes.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${messageRes.status}`);
            }

            const { response, tools, functionData } = await messageRes.json();

            // Extract search result IDs based on the function data
            let searchResultIds = [];
            if (functionData) {
                switch (functionData?.key) {
                    case 'single_location':
                        searchResultIds = [functionData.value];
                        break;

                    case 'multiple_locations':
                        searchResultIds = functionData.value.filter(Boolean);
                        break;

                    case 'directions': {
                        // Extract only the location IDs we need
                        const { originLocationId, destinationLocationId } = functionData.value;
                        setDirectionsLocationIds({ originLocationId, destinationLocationId });
                        break;
                    }
                    default:
                        break;
                }
            }

            console.log('Search result IDs:', searchResultIds);
            setSearchResults(searchResultIds);

            console.log('Agent tool calls:\n' + JSON.stringify(tools, null, 2));

            return response;
        } catch (error) {
            console.error('Error generating response:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            return 'I\'m sorry, I encountered an error processing your request. Please try again later.';
        } finally {
            setIsLoading(false);
        }
    }, [ensureSession]);

    // Function to clear directions data
    const clearDirectionsLocationIds = useCallback(() => {
        setDirectionsLocationIds(null);
    }, []);

    // Cleanup: end session on unmount
    useEffect(() => {
        return () => {
            if (sessionIdRef.current) {
                fetch(`${API_BASE_URL}/api/chat/end/${sessionIdRef.current}`, {
                    method: 'DELETE'
                }).catch(error => {
                    console.warn('Error ending session on unmount:', error);
                });
            }
        };
    }, []);

    // Provider value
    const geminiContextValue = {
        generateResponse: generateResponseWrapper,
        isLoading,
        searchResults,
        directionsLocationIds,
        clearDirectionsLocationIds,
        defaultPrompt
    };

    return (
        <GeminiContext.Provider value={geminiContextValue}>
            {children}
        </GeminiContext.Provider>
    );
}

// Custom hook to use the Gemini context
export function useGemini() {
    const context = useContext(GeminiContext);
    if (context === undefined) {
        throw new Error('useGemini must be used within a GeminiProvider');
    }
    return context;
}

export default GeminiProvider;

GeminiProvider.propTypes = {
    children: PropTypes.node.isRequired
};