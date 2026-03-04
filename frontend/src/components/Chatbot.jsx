import React, { useState, useEffect, useRef } from 'react';
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
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Bullet lines starting with * or •
        .replace(/^[\*•]\s+(.+)$/gm, '<li>$1</li>')
        // Newlines to <br>
        .replace(/\n/g, '<br/>');
    // Wrap consecutive <li> items in a <ul>
    html = html.replace(/(<li>.*?<\/li>)(<br\/>)*/g, '$1');
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, (match) => `<ul>${match}</ul>`);
    return html;
}

export default function Chatbot() {
    // State management
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '🌿 Hi! I am the EcoDetect Assistant.\n\nI can help you with:\n• Harmful insects & venomous animals\n• First aid for bites & stings\n• Safety precautions\n\nHow can I help you today?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Ref for auto-scrolling
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Toggle chat window
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const quickSuggestions = [
        "First aid for snake bite 🐍",
        "Identify insect 🐜",
        "Venomous spider check 🕷️",
        "Emergency help 🚑"
    ];

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
            const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();

            // Add bot response
            setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
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
                                {msg.sender === 'bot' ? (
                                    <div
                                        className="message-bubble"
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                                    />
                                ) : (
                                    <div className="message-bubble">{msg.text}</div>
                                )}
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
                            placeholder="Type your message..."
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
