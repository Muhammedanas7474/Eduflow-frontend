import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../store/slices/notificationSlice";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useSelector((state) => state.auth);
    const [status, setStatus] = useState("disconnected"); // disconnected, connecting, connected
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    useEffect(() => {
        let timeoutId;

        const initConnection = () => {
            if (socketRef.current) return;

            let wsUrl;
            if (import.meta.env.VITE_API_BASE_URL) {
                wsUrl = import.meta.env.VITE_API_BASE_URL.replace(/^http/, "ws") + "/ws/notifications/";
            } else {
                // Use current host - works with Vite proxy in dev and direct access in prod
                const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                const host = window.location.host; // Works with Vite proxy!
                wsUrl = `${protocol}//${host}/ws/notifications/`;
            }

            const socket = new WebSocket(`${wsUrl}?token=${token}`);
            socketRef.current = socket;
            setStatus("connecting");

            socket.onopen = () => {
                setStatus("connected");
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "notification") {
                        dispatch(addNotification({
                            id: Date.now(),
                            message: data.message,
                            created_at: data.created_at || new Date().toISOString(),
                            is_read: false
                        }));
                    } else if (data.type === "chat_notification") {
                        // Dispatch global toast for chat - REMOVED per user request
                        // dispatch(addNotification({
                        //     id: Date.now(),
                        //     title: `Message from ${data.sender_name}`,
                        //     message: data.message,
                        //     type: 'info', // or 'chat' if you have a specific style
                        //     created_at: data.created_at || new Date().toISOString(),
                        //     is_read: false
                        // }));

                        // Emit a custom window event so ChatPage can listen to it without using Redux
                        window.dispatchEvent(new CustomEvent('chat_message_received', { detail: data }));
                    }
                } catch (e) {
                    console.error("WS Parse Error", e);
                }
            };

            socket.onclose = (event) => {
                setStatus("disconnected");
                socketRef.current = null;
                // Auto-reconnect if unclean close
                if (!event.wasClean) {
                    reconnectTimeoutRef.current = setTimeout(initConnection, 3000);
                }
            };

            socket.onerror = (error) => {
                console.error("WS Error", error);
                socket.close();
            };
        };

        if (isAuthenticated && token) {
            initConnection();
        } else {
            // Disconnect if auth lost
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            setStatus("disconnected");
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [isAuthenticated, token, dispatch]);


    const contextValue = { status };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => useContext(WebSocketContext);
