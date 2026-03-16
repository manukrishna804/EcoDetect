import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

// Lightweight markdown → HTML converter for bot messages
function formatMessage(text) {
    if (!text) return '';
    let html = text
        // Escape HTML entities first
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Bold: **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic: *text*
        .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
        // Bullet lines starting with *, -, •, or numbers (1., 2.)
        .replace(/^(\d+\.|[\*\-•])\s+(.+)$/gm, '<li>$2</li>')
        // Newlines to <br>
        .replace(/\n/g, '<br/>');
    // Wrap consecutive <li> items in a <ul>
    html = html.replace(/(<li>.*?<\/li>)(<br\/>)*/g, '$1');
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, (match) => `<ul style="margin: 4px 0; padding-left: 20px;">${match}</ul>`);
    return html;
}

export default function Chatbot() {
    const navigate = useNavigate();
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: '🌿 Hi! I am your EcoDetect Assistant.\n\nI can help you with:\n• Snake safety & first aid\n• Identifying snakes with your camera\n• Finding nearby antivenom hospitals\n\nHow can I help you today?',
            actions: []
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userLocContext, setUserLocContext] = useState(null);

    // Ref for auto-scrolling
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-scroll when chat window is opened
    useEffect(() => {
        if (isOpen) {
            // Small timeout to allow the window DOM to render before scrolling
            setTimeout(scrollToBottom, 50);
        }
    }, [isOpen]);

    // Fetch location context
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocContext(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
            }, (error) => {
                console.log("Location access denied", error);
            });
        }
    }, []);

    // Toggle chat window
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const quickSuggestions = [
        "Snake bite first aid 🐍",
        "Nearest hospital 🏥",
        "Identify a snake 🔍",
        "Safety precautions 🛡️"
    ];

    // Handle structural actions from backend (e.g. OPEN_MAP, CALL_SOS)
    const handleTriggeredAction = (action) => {
        switch (action) {
            case "OPEN_FIRST_AID":
                navigate('/snake', { state: { activeTab: 'firstaid' } });
                break;
            case "OPEN_PRECAUTIONS":
                navigate('/snake', { state: { activeTab: 'precautions' } });
                break;
            case "OPEN_HOSPITAL_MAP":
                navigate('/hospitals');
                break;
            case "OPEN_CAMERA_DETECTION":
                navigate('/detect');
                break;
            case "CALL_EMERGENCY":
                // Deep link to snake emergency with SOS trigger
                navigate('/snake', { state: { openSOS: true } });
                break;
            default:
                break;
        }
    };

    const handleActionClick = (action) => {
        // Normalization: AI might return raw strings, OR human-readable ones
        switch (action) {
            case "OPEN_CAMERA_DETECTION":
            case "Scan with Camera":
            case "Scan Snake with Camera":
            case "Scan Snake":
                navigate('/detect');
                setIsOpen(false);
                break;
            case "OPEN_FIRST_AID":
            case "First Aid Guide":
            case "Open First Aid Guide":
                navigate('/snake', { state: { activeTab: 'firstaid' } });
                setIsOpen(false);
                break;
            case "OPEN_HOSPITAL_MAP":
            case "Find Hospitals":
            case "Find Nearby Hospitals":
            case "Nearest Hospitals":
                navigate('/hospitals');
                setIsOpen(false);
                break;
            case "CALL_EMERGENCY":
            case "Call SOS":
            case "Call Emergency":
                navigate('/snake', { state: { openSOS: true } });
                setIsOpen(false);
                break;
            case "OPEN_PRECAUTIONS":
            case "View Precautions":
            case "Snake Bite Precautions":
                navigate('/snake', { state: { activeTab: 'precautions' } });
                setIsOpen(false);
                break;
            default:
                // If it's not a predefined app routing action, treat it as a conversational option
                handleSendMessage(action);
                break;
        }
    };

    // Helper to get nice label for buttons
    const getActionLabel = (action) => {
        const labels = {
            "OPEN_FIRST_AID": "First Aid Guide",
            "OPEN_PRECAUTIONS": "Precautions",
            "OPEN_HOSPITAL_MAP": "Find Hospitals",
            "OPEN_CAMERA_DETECTION": "Scan Snake",
            "CALL_EMERGENCY": "Call SOS"
        };
        return labels[action] || action;
    };

    // Send message to backend
    const handleSendMessage = async (text) => {
        const messageToSend = typeof text === 'string' ? text : inputText;

        if (!messageToSend.trim() || isLoading) return;

        const userMessage = messageToSend.trim();
        setInputText('');

        // Add user message immediately
        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setIsLoading(true);

        try {
            // Call Flask backend
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    location: userLocContext
                }),
            });

            const data = await response.json();

            // Support new standardized action system
            const botText = data.message || data.reply || "I didn't quite catch that.";
            const botActions = data.suggestedActions || [];
            const triggerAction = data.action || "NONE";

            setMessages(prev => [...prev, {
                sender: 'bot',
                text: botText,
                actions: botActions,
                triggeredAction: triggerAction
            }]);

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [
                ...prev,
                { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chatbot-container">
            {/* Floating Button */}
            {!isOpen && (
                <button className="chatbot-button" onClick={toggleChat}>
                    <span style={{ fontSize: '1.5rem' }}>🌿</span>
                    <span className="chatbot-badge">!</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-content">
                            <div className="chatbot-avatar">🌿</div>
                            <div>
                                <h3>EcoDetect Assistant</h3>
                                <p>Wildlife safety & first aid</p>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={toggleChat}>
                            ✕
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chatbot-message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
                            >
                                {msg.sender === 'bot' && (
                                    <div className="message-avatar">🌿</div>
                                )}
                                <div className="message-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                    {msg.sender === 'bot' ? (
                                        <div
                                            className="message-bubble"
                                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                                        />
                                    ) : (
                                        <div className="message-bubble">{msg.text}</div>
                                    )}

                                    {/* Action Buttons for Bot Messages */}
                                    {msg.sender === 'bot' && msg.actions && msg.actions.length > 0 && (
                                        <div className="bot-actions" style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            marginTop: '8px',
                                            paddingLeft: '4px'
                                        }}>
                                            {msg.actions.map((action, idx) => (
                                                <button
                                                    key={idx}
                                                    className="action-link-btn"
                                                    onClick={() => handleActionClick(action)}
                                                    style={{
                                                        backgroundColor: '#16a34a',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        padding: '6px 12px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                                >
                                                    {getActionLabel(action)} →
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="chatbot-message bot-message">
                                <div className="message-avatar">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </div>
                                <div className="message-bubble typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    <div className="chatbot-suggestions">
                        {quickSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                className="suggestion-chip"
                                onClick={() => handleSendMessage(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button
                            className="chatbot-send"
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
