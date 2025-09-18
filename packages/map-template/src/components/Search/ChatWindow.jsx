import { useState, useEffect } from 'react';
import { useGemini } from '../../providers/GeminiProvider';
import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatWindow.scss';
import primaryColorState from '../../atoms/primaryColorState';
import apiKeyState from '../../atoms/apiKeyState';

function ChatWindow({ message, isEnabled }) {
    const primaryColor = useRecoilValue(primaryColorState);
    const [messages, setMessages] = useState([]);
    const apiKey = useRecoilValue(apiKeyState);

    // Use Gemini provider
    const { generateResponse, getAvailableMCPTools, isLoading, tools } = useGemini();

    // Default prompt fields (can be made props or settings later)
    const [promptFields] = useState({
        'System context': 'You are a indoor location assistant with MapsIndoors developed by MapsPeople.',
        'MapsIndoors Context': 'The available data includes locations(POI, areas and rooms). Each location can have a name, location type, categories, alias, description, floor, latitude and longitude and custom properties(Key/Value pairs) that contain custom valuable data to describe the functionality of the specific location. This can be the amount of people that can sit inside a room, or the current menu of a restaurant. If asked about a distance or travel time to a specific location, ask the user to provide the name of a location they are close to, so the calculation can be performed between that location and the end location.',
        'MapsIndoors Limitations': 'You are not able to show wayfinding or routing on the map. You are not able to book meeting rooms. You do not have the users location, but you can ask what room they are nearby and use that for context when providing distance calculations. You are not able to search the web or use other sources than what is available through the MCP tools. You should always try and search for what is asked, if nothing else would make sense. If no data is returned, that is okay, inform the customer of that.',
        'Response': 'Respond in a helpful tone that aims to guide the user to find what they are looking for. If the user query is unclear ask follow up questions to identify the missing information. Never respond with a latitude or longitude or location id and external id for a location unless asked to. When refering to 1 to 3 locations, respond with a location name when refering to the location. If the query response contains more than 3 results, mention the total number of locations found, but do not list all of them unless asked. When refering to a floor, always do that by refering to the name of the floor, never the index.'
    });

    // Fetch tools on mount
    useEffect(() => {
        getAvailableMCPTools().catch(console.error);
    }, [getAvailableMCPTools]);

    // Maybe expose a function to add messages, like onUserMessage, then pass it from the Search to the ChatWindow

    // Handle new message from parent component
    useEffect(() => {
        if (!message?.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: message.trim(),
            type: 'user'
        };
        setMessages(prev => [...prev, userMessage]);

        // Call Gemini service for response (provider API expects an object)
        generateResponse(apiKey, message.trim(), promptFields, tools)
            .then((response) => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        text: response,
                        type: 'server'
                    }
                ]);
            })
            .catch(() => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now() + 2,
                        text: 'Sorry, I encountered an error processing your request.',
                        type: 'server'
                    }
                ]);
            });
    }, [message, generateResponse, apiKey, promptFields]);

    // Keep chat visible if there are messages, even when parent disables visibility
    // This might need to be a bit tweaked
    if (!isEnabled && messages.length === 0) return null;

    return (
        <div className="chat-window" style={{ '--chat-window-primary-color': primaryColor }}>
            {messages.map((message) => (
                <div key={message.id} className={`chat-window__message chat-window__message--${message.type}`}>
                    {message.type === 'server' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.text}
                        </ReactMarkdown>
                    ) : (
                        <span>{message.text}</span>
                    )}
                </div>
            ))}
            {isLoading && (
                <p className="chat-window__message chat-window__message--server chat-window__message--loading">...
                </p>
            )}
        </div>
    );
}

ChatWindow.propTypes = {
    message: PropTypes.string,
    isEnabled: PropTypes.bool
};

export default ChatWindow;
