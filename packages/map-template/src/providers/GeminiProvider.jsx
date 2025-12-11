import { createContext, useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { generateResponse, systemPrompt, getFinalFunctionResponse } from 'mcp-demo-client';

// Create the context
const GeminiContext = createContext();

export function GeminiProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [directionsLocationIds, setDirectionsLocationIds] = useState(null);
    const defaultPrompt = systemPrompt;

    // Wrapper function to generate a response using the Gemini service
    const generateResponseWrapper = useCallback(async (apiKey, prompt, promptFields) => {
        setIsLoading(true);
        // Clear previous directions data when starting a new request
        setDirectionsLocationIds(null);
        try {
            console.log('Generating response for prompt:', prompt);
            const response = await generateResponse(apiKey, prompt, promptFields);

            const finalFunctionResponse = getFinalFunctionResponse();
            // Extract search result IDs based on the final function response
            let searchResultIds = [];
            switch (finalFunctionResponse?.key) {
                case 'single_location':
                    searchResultIds = [finalFunctionResponse.value];
                    break;

                case 'multiple_locations':
                    searchResultIds = finalFunctionResponse.value.filter(Boolean);
                    break;

                case 'directions': {
                    // Extract only the location IDs we need
                    const { originLocationId, destinationLocationId } = finalFunctionResponse.value;
                    setDirectionsLocationIds({ originLocationId, destinationLocationId });
                    // Clear search results since this is a directions request, not a search
                    setSearchResults([]);
                    break;
                }
                default:
                    break;
            }

            // Check for search results after the response is generated;
            console.log('Search result IDs:', searchResultIds);

            if (searchResultIds.length > 0) {
                console.log('Search results found:', searchResultIds);
                setSearchResults(searchResultIds);
            }

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
    }, []);

    // Function to clear directions data
    const clearDirectionsLocationIds = useCallback(() => {
        setDirectionsLocationIds(null);
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