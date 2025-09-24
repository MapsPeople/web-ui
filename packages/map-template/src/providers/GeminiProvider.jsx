import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { generateResponse, getAvailableMCPTools, getLastSearchResultIds, systemPrompt } from 'mcp-demo-client';

// Create the context
const GeminiContext = createContext();

export function GeminiProvider({ children }) {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [tools, setTools] = useState({ functionDeclarations: [] });
    const [searchResults, setSearchResults] = useState([]);
    const defaultPrompt = systemPrompt;

    // Get available MCP tools using the TypeScript service
    const getAvailableMCPToolsWrapper = useCallback(async () => {
        // Log the system prompt
        try {
            const toolsObject = await getAvailableMCPTools();
            setTools(toolsObject);
            return toolsObject;
        } catch (error) {
            console.error('Error getting MCP tools:', error);
            return { functionDeclarations: [] };
        }
    }, []);

    // Wrapper function to generate a response using the Gemini service
    const generateResponseWrapper = useCallback(async (apiKey, prompt, promptFields, toolsParam) => {
        setIsLoading(true);
        try {
            console.log('Generating response for prompt:', prompt);
            const response = await generateResponse(apiKey, prompt, promptFields, toolsParam);

            // Check for search results after the response is generated
            const searchResultIds = getLastSearchResultIds();
            console.log('Search result IDs:', searchResultIds);

            if (searchResultIds.length > 0) {
                console.log('Search results found:', searchResultIds);
                setSearchResults(searchResultIds);
            }

            console.log('Final answer:', response);
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

    // Initialize tools on provider mount
    useEffect(() => {
        getAvailableMCPToolsWrapper().catch(console.error);
    }, [getAvailableMCPToolsWrapper]);

    // Provider value
    const geminiContextValue = {
        generateResponse: generateResponseWrapper,
        isLoading,
        tools,
        searchResults,
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