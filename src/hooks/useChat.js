import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, updateConnectionStatus } from "../store/slices/chatSlice";
import { getWebSocketToken } from "../api/chat.api";

const useChat = (activeRoomId) => {
    const dispatch = useDispatch();
    const [socket, setSocket] = useState(null);
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
        if (socket) {
            socket.close();
        }

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsHost = window.location.host; // Uses current host (e.g. localhost:5173 or ip:port)
        // Vite proxy will handle /ws -> localhost:80/ws
        const url = `${wsProtocol}//${wsHost}/ws/chat/${activeRoomId}/?token=${tokenRef.current}`;

        const ws = new WebSocket(url);

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
            // Simple reconnect logic if needed
        };

        ws.onerror = (error) => {
            console.error("WS Error:", error);
            ws.close();
        };

        setSocket(ws);
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
            if (socket) socket.close();
        };
    }, [activeRoomId, connect]);

    const sendMessage = (content) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ message: content }));
        }
    };

    return { sendMessage };
};

export default useChat;
