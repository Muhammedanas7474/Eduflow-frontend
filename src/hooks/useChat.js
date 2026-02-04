import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, updateConnectionStatus } from "../store/slices/chatSlice";
import { getWebSocketToken } from "../api/chat.api";

const useChat = (activeRoomId) => {
    const dispatch = useDispatch();
    const socketRef = useRef(null);
    const tokenRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // Fetch token once
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await getWebSocketToken();
                tokenRef.current = token;
            } catch (error) {
                console.error("Failed to fetch WS token:", error);
            }
        };
        fetchToken();
    }, []);

    const connect = useCallback(() => {
        if (!activeRoomId || !tokenRef.current) return;

        // Close existing
        if (socketRef.current) {
            socketRef.current.close();
        }

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = window.location.host;
        // Vite proxy will handle /ws -> http://127.0.0.1:80/ws
        const url = `${wsProtocol}//${wsHost}/ws/chat/${activeRoomId}/?token=${tokenRef.current}`;

        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("WS Connected");
            dispatch(updateConnectionStatus(true));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "chat_message") {
                dispatch(addMessage({
                    roomId: activeRoomId,
                    message: {
                        id: data.id,
                        content: data.message,
                        sender_name: data.sender_name,
                        timestamp: data.timestamp,
                        user_id: data.user_id,
                    }
                }));
            }
        };

        ws.onclose = () => {
            console.log("WS Disconnected");
            dispatch(updateConnectionStatus(false));
            // Auto-reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
                if (activeRoomId && tokenRef.current) {
                    console.log("Attempting to reconnect...");
                    connect();
                }
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error("WS Error:", error);
            ws.close();
        };

    }, [activeRoomId, dispatch]);

    // Connect when activeRoomId changes and token is available
    useEffect(() => {
        if (tokenRef.current && activeRoomId) {
            connect();
        } else if (!tokenRef.current && activeRoomId) {
            // Wait for token then connect
            const checkToken = setInterval(() => {
                if (tokenRef.current) {
                    clearInterval(checkToken);
                    connect();
                }
            }, 500);
            return () => clearInterval(checkToken);
        }

        return () => {
            if (socketRef.current) socketRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [activeRoomId, connect]);

    const sendMessage = (content) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ message: content }));
        }
    };

    return { sendMessage };
};

export default useChat;
