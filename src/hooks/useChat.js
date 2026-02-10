import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
<<<<<<< HEAD
import { addMessage, updateConnectionStatus } from "../store/slices/chatSlice";
=======
import {
    addMessage,
    updateConnectionStatus,
    setOnlineUsers,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    markMessageRead,
} from "../store/slices/chatSlice";
>>>>>>> ed5922e (feat vedio call implementation)
import { getWebSocketToken } from "../api/chat.api";

const useChat = (activeRoomId) => {
    const dispatch = useDispatch();
    const socketRef = useRef(null);
    const tokenRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
<<<<<<< HEAD
=======
    const typingTimeoutRef = useRef(null);
>>>>>>> ed5922e (feat vedio call implementation)

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
<<<<<<< HEAD
        // Vite proxy will handle /ws -> http://127.0.0.1:80/ws
=======
>>>>>>> ed5922e (feat vedio call implementation)
        const url = `${wsProtocol}//${wsHost}/ws/chat/${activeRoomId}/?token=${tokenRef.current}`;

        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("WS Connected");
            dispatch(updateConnectionStatus(true));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
<<<<<<< HEAD
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
=======

            switch (data.type) {
                case "chat_message":
                    dispatch(addMessage({
                        roomId: activeRoomId,
                        message: {
                            id: data.id,
                            content: data.message,
                            sender_name: data.sender_name,
                            timestamp: data.timestamp,
                            user_id: data.user_id,
                            is_read: false,
                        }
                    }));
                    break;

                case "online_users":
                    dispatch(setOnlineUsers(data.users));
                    break;

                case "presence":
                    if (data.status === "online") {
                        dispatch(setUserOnline(data.user_id));
                    } else {
                        dispatch(setUserOffline(data.user_id));
                    }
                    break;

                case "typing":
                    dispatch(setUserTyping({
                        roomId: activeRoomId,
                        userId: data.user_id,
                        fullName: data.full_name,
                        isTyping: data.is_typing,
                    }));
                    break;

                case "read_receipt":
                    dispatch(markMessageRead({
                        roomId: activeRoomId,
                        messageId: data.message_id,
                    }));
                    break;

                default:
                    break;
>>>>>>> ed5922e (feat vedio call implementation)
            }
        };

        ws.onclose = () => {
            console.log("WS Disconnected");
            dispatch(updateConnectionStatus(false));
<<<<<<< HEAD
            // Auto-reconnect after 3 seconds
=======
>>>>>>> ed5922e (feat vedio call implementation)
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
<<<<<<< HEAD
            // Wait for token then connect
=======
>>>>>>> ed5922e (feat vedio call implementation)
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
<<<<<<< HEAD
            socketRef.current.send(JSON.stringify({ message: content }));
        }
    };

    return { sendMessage };
=======
            socketRef.current.send(JSON.stringify({
                type: "chat_message",
                message: content,
            }));
        }
    };

    const sendTyping = (isTyping) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "typing",
                is_typing: isTyping,
            }));
        }
    };

    const startTyping = () => {
        sendTyping(true);
        // Auto-stop typing after 3 seconds of no input
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            sendTyping(false);
        }, 3000);
    };

    const stopTyping = () => {
        sendTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const sendReadReceipt = (messageId) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "read_receipt",
                message_id: messageId,
            }));
        }
    };

    return { sendMessage, startTyping, stopTyping, sendReadReceipt };
>>>>>>> ed5922e (feat vedio call implementation)
};

export default useChat;
