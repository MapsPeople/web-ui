import { createContext, useContext, useRef, useCallback, useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import PropTypes from 'prop-types';

// Gemini API Key
// TODO: Find a better way to handle this
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Google AI client
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Default model configuration
const generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
};

// Create the context
const GeminiContext = createContext();

export function GeminiProvider({ children }) {
    // State
    const [isLoading, setIsLoading] = useState(false);
    const [tools, setTools] = useState({ functionDeclarations: [] });

    // Refs to maintain state across renders
    const chatSessionRef = useRef(null);
    const mcpClientRef = useRef(null);
    const systemPromptRef = useRef(undefined);

    // Initialize MCP Client
    const initializeMCPClient = useCallback(async () => {
        const mcpServerUrl = new URL('http://localhost:9001/mcp/');
        mcpClientRef.current = new Client({
            name: 'streamhttp-client',
            version: '1.0.0',
        });
        const transport = new StreamableHTTPClientTransport(mcpServerUrl);
        await mcpClientRef.current.connect(transport);
        console.log('Connected using streamable-http transport!');
    }, []);

    // Check if the response contains a function call
    const doesContainFunctionCall = useCallback((response) => {
        if (response.functionCalls) {
            for (const functionCall of response.functionCalls) {
                console.log('Function call detected:', functionCall);
                if (functionCall.name) {
                    console.log('Function call name:', functionCall.name);
                    return true;
                }
            }
        }
        return false;
    }, []);

    // Process the tool call requested by the model
    const processCandidateResponse = useCallback(async (response) => {
        let answer = 'Unable to process function call';
        if (response.candidates) {
            for (const functionCall of response.candidates) {
                console.log('Function call detected:', functionCall);
                const parts = (functionCall.content && functionCall.content.parts) ? functionCall.content.parts : [];
                for (const part of parts) {
                    console.log('Part of function call:', part);

                    if (part.functionCall) {
                        const toolName = part.functionCall.name;
                        const toolArgs = part.functionCall.args;
                        console.log('Tool name:', toolName);
                        console.log('Tool arguments:', toolArgs);

                        // Ensure mcpClient is initialized before calling callTool
                        if (!mcpClientRef.current) {
                            throw new Error('MCP client is not initialized. Please initialize it before calling this function.');
                        }

                        const toolResponse = await mcpClientRef.current.callTool({
                            name: toolName,
                            arguments: toolArgs,
                        });
                        console.log('Tool response:', toolResponse);

                        if (toolResponse && toolResponse.content) {
                            if (toolResponse.structuredContent) {
                                console.log('Received structured response from MCP client:', toolResponse.structuredContent);
                                answer = JSON.stringify(toolResponse.structuredContent);
                            } else if (Array.isArray(toolResponse.content) && toolResponse.content.length > 0) {
                                const firstResponse = toolResponse.content[0];
                                if (firstResponse.text) {
                                    console.log('Received response from MCP client:', firstResponse.text);
                                    answer = firstResponse.text;
                                }
                            }
                        } else {
                            console.warn('MCP client returned an empty or invalid response.');
                            answer = 'I\'m sorry, I couldn\'t process your request. Please try again.';
                        }

                        // Emit custom events for tool responses (for reactive UI updates)
                        if (toolName === 'search_locations' && toolResponse?.content) {
                            document.dispatchEvent(new CustomEvent('gemini:searchResults', {
                                detail: { toolResponse, toolArgs }
                            }));
                        }

                        if (toolName === 'get_location' && toolResponse?.content) {
                            document.dispatchEvent(new CustomEvent('gemini:locationHighlight', {
                                detail: { toolResponse, toolArgs }
                            }));
                        }
                    }
                }
            }
        }
        return answer;
    }, []);

    // Get available MCP tools
    const getAvailableMCPTools = useCallback(async () => {
        if (!mcpClientRef.current) {
            await initializeMCPClient();
        }
        const toolsList = (await mcpClientRef.current.listTools()).tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parametersJsonSchema: tool.inputSchema,
        }));
        const toolsObject = { functionDeclarations: toolsList };
        setTools(toolsObject);
        return toolsObject;
    }, [initializeMCPClient]);

    // Main function to generate a response
    const generateResponse = useCallback(async (apiKey, prompt, promptFields, toolsParam) => {
        setIsLoading(true);
        try {
            console.log('Generating response for prompt:', prompt);

            if (!mcpClientRef.current) {
                console.log('MCP client not initialized. Initializing now...');
                await initializeMCPClient();
            }

            // Build the system prompt from promptFields
            const promptString = Object.keys(promptFields).map((key) => `${key}: ${promptFields[key]}`).join('\n\n');
            if (systemPromptRef.current !== promptString) {
                systemPromptRef.current = promptString;
                chatSessionRef.current = null;
            }

            if (chatSessionRef.current === null) {
                console.log('Creating chat session...');
                chatSessionRef.current = genAI.chats.create({
                    model: 'gemini-2.5-flash',
                    config: generationConfig,
                    history: [
                        {
                            role: 'user',
                            parts: [
                                { text: `api key is "${apiKey}"` },
                            ],
                        },
                        {
                            role: 'model',
                            parts: [
                                { text: systemPromptRef.current },
                                { text: `api key is "${apiKey}"` },
                                { text: 'When asked for data, make sure to load the context and then search etc.' }
                            ],
                        },
                    ],
                });
            }

            // Send the user's question to the model
            let lastResponse = await chatSessionRef.current.sendMessage({
                message: prompt,
                config: {
                    tools: [toolsParam],
                },
            });

            // Handle function calls
            let cycles = 0;
            console.log('Initial response:', lastResponse);
            while (doesContainFunctionCall(lastResponse)) {
                console.log('Processing function call response:', lastResponse);
                if (lastResponse.candidates) {
                    for (const candidate of lastResponse.candidates) {
                        console.log('Candidate response:', candidate);
                        if (doesContainFunctionCall(lastResponse)) {
                            let answer = await processCandidateResponse(lastResponse);
                            lastResponse = await chatSessionRef.current.sendMessage({ message: answer });
                        } else {
                            console.log('No function call detected in candidate response.');
                            break;
                        }
                    }
                }
                cycles++;
                console.log('Cycle count:', cycles);
                if (cycles > 10) {
                    console.error('Too many cycles, breaking out of the loop.');
                    break;
                }
            }

            const finalResponseText = lastResponse.text;
            console.log('Final answer:', finalResponseText);
            return finalResponseText;

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
    }, [initializeMCPClient, doesContainFunctionCall, processCandidateResponse]);

    // Provider value
    const geminiContextValue = { generateResponse, getAvailableMCPTools, isLoading, tools };

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