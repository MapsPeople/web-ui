import { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create the context
const GeminiContext = createContext();

// API base URL - can be configured via environment variable or defaults to localhost:4000
const API_BASE_URL = 'http://localhost:4000';

export function GeminiProvider({ children, enabled }) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [directionsLocationIds, setDirectionsLocationIds] = useState(null);
    const defaultPrompt = '';

    // Store session info - using refs to track current session without causing re-renders
    const sessionIdRef = useRef(null);
    const currentApiKeyRef = useRef(null);

    // Helper function to create or get session
    const ensureSession = useCallback(async (apiKey) => {
        // Check if we need to create a new session
        const needsNewSession =
            !sessionIdRef.current ||
            currentApiKeyRef.current !== apiKey;

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

            // Create new session with a client-generated session ID
            const sessionId = crypto.randomUUID();
            const startRes = await fetch(`${API_BASE_URL}/api/chat/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey,
                    sessionId
                })
            });

            if (!startRes.ok) {
                const errorData = await startRes.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to create session: ${startRes.status}`);
            }

            sessionIdRef.current = sessionId;
            currentApiKeyRef.current = apiKey;
        }

        return sessionIdRef.current;
    }, []);

    // Helper function to process function data and extract search results
    const processFunctionData = useCallback((functionData) => {
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
        return searchResultIds;
    }, []);

    // Handle streaming response from /api/chat/stream endpoint
    const handleStreamingResponse = useCallback(async (sessionId, prompt, extra, callbacks) => {
        const { onUpdate, onComplete } = callbacks;

        try {
            const streamRes = await fetch(`${API_BASE_URL}/api/chat/stream`, {
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

            if (!streamRes.ok) {
                const errorData = await streamRes.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${streamRes.status}`);
            }

            const reader = streamRes.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';
            let lastFunctionData = null;

            let reading = true;
            while (reading) {
                const { done, value } = await reader.read();
                if (done) {
                    reading = false;
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                // Keep the last incomplete line in the buffer
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim() || line.startsWith(':')) continue;

                    // Parse SSE format: "data: {...}"
                    if (line.startsWith('data: ')) {
                        // Remove SSE "data: " prefix (6 characters)
                        const jsonStr = line.slice(6);

                        // Skip completion signal
                        if (jsonStr === '[DONE]') {
                            continue;
                        }

                        try {
                            const chunk = JSON.parse(jsonStr);

                            // Update consumer with the flag and text
                            if (onUpdate) {
                                onUpdate({
                                    text: chunk.text,
                                    isThought: chunk.isThought
                                });
                            }

                            // Accumulate response text (both thoughts and responses)
                            fullResponse += chunk.text;

                            // Track function data if present
                            if (chunk.functionResponse) {
                                lastFunctionData = chunk.functionResponse;
                            }

                            // Log tool calls if present
                            if (chunk.log?.toolCalls) {
                                console.log('Agent tool calls:\n' + JSON.stringify(chunk.log.toolCalls, null, 2));
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse streaming chunk:', jsonStr, parseError);
                        }
                    }
                }
            }

            // Process final function data
            if (lastFunctionData) {
                const searchResultIds = processFunctionData(lastFunctionData);
                console.log('Search result IDs:', searchResultIds);
                setSearchResults(searchResultIds);
            }

            // Call onComplete callback with final response
            if (onComplete) {
                onComplete({ response: fullResponse, functionData: lastFunctionData });
            }

            return fullResponse;
        } catch (error) {
            console.error('Error in streaming response:', error);
            throw error;
        }
    }, [processFunctionData]);

    // Handle non-streaming API response
    const handleNonStreamingResponse = useCallback(async (sessionId, prompt, extra, onComplete) => {
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
        const searchResultIds = processFunctionData(functionData);

        console.log('Search result IDs:', searchResultIds);
        setSearchResults(searchResultIds);

        console.log('Agent tool calls:\n' + JSON.stringify(tools, null, 2));

        // Call onComplete callback if provided
        if (onComplete) {
            onComplete({ response, tools, functionData });
        }

        return response;
    }, [processFunctionData]);

    // Wrapper function to generate a response using the Gemini service
    // Supports optional callbacks for streaming and intermediate data
    const generateResponseWrapper = useCallback(async (apiKey, prompt, options = {}) => {
        if (!enabled) {
            return;
        }

        setIsLoading(true);
        setDirectionsLocationIds(null);

        try {
            console.log('Generating response for prompt:', prompt);

            // Extract options
            const extra = options.extra || {};
            const { onUpdate, onComplete } = options;

            // Ensure we have a valid session
            const sessionId = await ensureSession(apiKey);

            // Route to streaming or non-streaming endpoint based on callbacks
            if (onUpdate) {
                return await handleStreamingResponse(sessionId, prompt, extra, {
                    onUpdate,
                    onComplete
                });
            }

            return await handleNonStreamingResponse(sessionId, prompt, extra, onComplete);
        } catch (error) {
            console.error('Error generating response:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            const errorMessage = 'I\'m sorry, I encountered an error processing your request. Please try again later.';
            // Call onComplete with error if provided
            if (options.onComplete) {
                options.onComplete({ response: errorMessage, error });
            }
            return errorMessage;
        } finally {
            setIsLoading(false);
        }
    }, [ensureSession, enabled, handleStreamingResponse, handleNonStreamingResponse]);

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
        enabled,
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
    children: PropTypes.node.isRequired,
    enabled: PropTypes.bool
};