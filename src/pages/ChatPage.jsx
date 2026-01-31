import { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import './ChatPage.css';

const ChatPage = () => {
    const [room, setRoom] = useState('general');
    const [inputRoom, setInputRoom] = useState('general');
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    const {
        messages,
        isConnected,
        connectionError,
        userInfo,
        connect,
        disconnect,
        sendMessage,
        clearMessages,
    } = useChat(room);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (inputRoom.trim()) {
            disconnect();
            clearMessages();
            setRoom(inputRoom.trim());
        }
    };

    const handleConnect = () => {
        connect();
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    return (
        <div className="chat-page">
            <div className="chat-container">
                {/* Header */}
                <div className="chat-header">
                    <h1>💬 EduFlow Chat</h1>
                    <p>Real-time messaging with tenant isolation</p>
                </div>

                {/* Room Selection */}
                <div className="chat-card">
                    <h2>Room Settings</h2>
                    <form onSubmit={handleJoinRoom} className="room-form">
                        <input
                            type="text"
                            value={inputRoom}
                            onChange={(e) => setInputRoom(e.target.value)}
                            placeholder="Enter room name..."
                            className="chat-input"
                        />
                        <button type="submit" className="btn-secondary">
                            Set Room
                        </button>
                    </form>

                    <div className="connection-controls">
                        {!isConnected ? (
                            <button onClick={handleConnect} className="btn-primary">
                                🔌 Connect to "{room}"
                            </button>
                        ) : (
                            <button onClick={disconnect} className="btn-danger">
                                ❌ Disconnect
                            </button>
                        )}
                    </div>

                    {/* Connection Status */}
                    <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </div>

                    {connectionError && (
                        <div className="error-message">{connectionError}</div>
                    )}

                    {userInfo && (
                        <div className="user-info">
                            <span>👤 {userInfo.userName}</span>
                            <span>🏢 Tenant {userInfo.tenantId}</span>
                            <span>🎭 {userInfo.role}</span>
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div className="chat-card chat-area">
                    <h2>Messages</h2>
                    <div className="messages-container">
                        {messages.length === 0 ? (
                            <div className="empty-state">
                                {isConnected
                                    ? 'No messages yet. Start the conversation!'
                                    : 'Connect to start chatting'}
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${msg.type === 'system' ? 'system' : ''} ${msg.userId === userInfo?.userId ? 'own' : ''
                                        }`}
                                >
                                    {msg.type === 'system' ? (
                                        <span className="system-text">📢 {msg.message}</span>
                                    ) : (
                                        <>
                                            <div className="message-header">
                                                <span className="sender">{msg.userName}</span>
                                                <span className="time">
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="message-content">{msg.message}</div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="message-form">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isConnected ? 'Type a message...' : 'Connect to send messages'}
                            disabled={!isConnected}
                            className="chat-input"
                        />
                        <button
                            type="submit"
                            disabled={!isConnected || !inputMessage.trim()}
                            className="btn-primary"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
