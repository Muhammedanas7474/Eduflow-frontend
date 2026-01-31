import { useState, useEffect, useRef, useCallback } from 'react';
import { getWebSocketToken } from '../api/chat.api';

/**
 * Custom hook for managing WebSocket chat connections
 * @param {string} room - Room name to join
 * @returns {object} Chat state and functions
 */
export const useChat = (room) => {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(async () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        try {
            // Get WebSocket token from backend
            const token = await getWebSocketToken();

            // Determine WebSocket URL based on current location
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsHost = window.location.hostname;
            const wsPort = window.location.port === '5173' ? '80' : window.location.port; // Dev server vs production
            const wsUrl = `${wsProtocol}//${wsHost}${wsPort ? ':' + wsPort : ''}/ws/chat/${room}/?token=${token}`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
                setConnectionError(null);
                console.log('✅ WebSocket connected to room:', room);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'connected') {
                        // Store user info from welcome message
                        setUserInfo({
                            userId: data.user_id,
                            userName: data.user_name,
                            tenantId: data.tenant_id,
                            role: data.role,
                        });
                        // Add system message
                        setMessages(prev => [...prev, {
                            type: 'system',
                            message: data.message,
                            timestamp: new Date().toISOString(),
                        }]);
                    } else if (data.type === 'message') {
                        // Add chat message
                        setMessages(prev => [...prev, {
                            type: 'message',
                            message: data.message,
                            userId: data.user_id,
                            userName: data.user_name,
                            tenantId: data.tenant_id,
                            timestamp: new Date().toISOString(),
                        }]);
                    }
                } catch (e) {
                    console.error('Failed to parse message:', e);
                }
            };

            ws.onerror = () => {
                setConnectionError('Connection error');
            };

            ws.onclose = (event) => {
                setIsConnected(false);
                wsRef.current = null;

                if (event.code === 4001) {
                    setConnectionError('Authentication failed');
                } else if (event.code !== 1000) {
                    // Unexpected close - try to reconnect
                    setConnectionError('Connection lost. Reconnecting...');
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, 3000);
                }
            };
        } catch (error) {
            setConnectionError('Failed to get authentication token');
            console.error('Connection failed:', error);
        }
    }, [room]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close(1000);
            wsRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback((message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && message.trim()) {
            wsRef.current.send(JSON.stringify({ message: message.trim() }));
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        messages,
        isConnected,
        connectionError,
        userInfo,
        connect,
        disconnect,
        sendMessage,
        clearMessages: () => setMessages([]),
    };
};

export default useChat;
