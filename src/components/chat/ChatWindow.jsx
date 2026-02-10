import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getChatMessages } from "../../api/chat.api";
import { setMessages } from "../../store/slices/chatSlice";

<<<<<<< HEAD
const ChatWindow = ({ sendMessage }) => {
    const dispatch = useDispatch();
    const { activeRoom, messages } = useSelector(state => state.chat);
=======
const ChatWindow = ({ sendMessage, startTyping, stopTyping, sendReadReceipt, onStartCall }) => {
    const dispatch = useDispatch();
    const { activeRoom, messages, typingUsers, onlineUsers } = useSelector(state => state.chat);
>>>>>>> ed5922e (feat vedio call implementation)
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { user } = useSelector(state => state.auth);

    const roomMessages = activeRoom ? messages[activeRoom.id] || [] : [];
<<<<<<< HEAD
=======
    const roomTyping = activeRoom ? typingUsers[activeRoom.id] || {} : {};
    const typingNames = Object.values(roomTyping);

    const isDM = activeRoom?.type === "DM";
    const otherUserId = activeRoom?.other_user?.user_id;
    const isOtherOnline = otherUserId ? onlineUsers.includes(otherUserId) : false;
>>>>>>> ed5922e (feat vedio call implementation)

    useEffect(() => {
        if (!activeRoom) return;

        const loadHistory = async () => {
            try {
                const history = await getChatMessages(activeRoom.id);
                dispatch(setMessages({ roomId: activeRoom.id, messages: history }));
            } catch (error) {
                console.error("Failed to load history", error);
            }
        };
        loadHistory();
    }, [activeRoom, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [roomMessages]);

<<<<<<< HEAD
    // Auto-focus input when entering room
=======
>>>>>>> ed5922e (feat vedio call implementation)
    useEffect(() => {
        if (activeRoom) {
            inputRef.current?.focus();
        }
    }, [activeRoom]);

<<<<<<< HEAD
=======
    // Send read receipts for new messages from others
    useEffect(() => {
        if (!activeRoom || roomMessages.length === 0) return;
        const lastMsg = roomMessages[roomMessages.length - 1];
        if (lastMsg && String(lastMsg.sender_id || lastMsg.user_id) !== String(user?.id) && !lastMsg.is_read) {
            sendReadReceipt?.(lastMsg.id);
        }
    }, [roomMessages, activeRoom, user?.id, sendReadReceipt]);

>>>>>>> ed5922e (feat vedio call implementation)
    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
<<<<<<< HEAD
        // Keep focus after sending
        inputRef.current?.focus();
    };

=======
        stopTyping?.();
        inputRef.current?.focus();
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (e.target.value) {
            startTyping?.();
        } else {
            stopTyping?.();
        }
    };

>>>>>>> ed5922e (feat vedio call implementation)
    if (!activeRoom) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-500">
                <div className="text-center">
<<<<<<< HEAD
                    <h3 className="text-2xl font-bold mb-2">Welcome to EduFlow Chat</h3>
                    <p>Select a course room to start messaging.</p>
=======
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-300">Welcome to EduFlow Chat</h3>
                    <p className="text-gray-500">Select a conversation to start messaging</p>
>>>>>>> ed5922e (feat vedio call implementation)
                </div>
            </div>
        );
    }

<<<<<<< HEAD
    return (
        <div className="flex-1 flex flex-col bg-gray-950 h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
                <h3 className="text-lg font-bold text-white">{activeRoom.course_title || activeRoom.name}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
=======
    const getRoomTitle = () => {
        if (isDM && activeRoom.other_user) {
            return `User ${activeRoom.other_user.user_id}`;
        }
        return activeRoom.course_title || activeRoom.name;
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-950 h-full">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isDM
                            ? "bg-gradient-to-br from-purple-500 to-pink-500"
                            : "bg-gradient-to-br from-green-500 to-emerald-600"
                        }`}>
                        {isDM ? "👤" : "📚"}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{getRoomTitle()}</h3>
                        {isDM && (
                            <span className={`text-xs ${isOtherOnline ? "text-green-400" : "text-gray-500"}`}>
                                {isOtherOnline ? "● Online" : "● Offline"}
                            </span>
                        )}
                        {!isDM && (
                            <span className="text-xs text-gray-500">
                                Course Group Chat
                            </span>
                        )}
                    </div>
                </div>

                {/* Call button — only for DM rooms */}
                {isDM && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onStartCall?.(otherUserId)}
                            disabled={!isOtherOnline}
                            className={`p-2.5 rounded-full transition-all ${isOtherOnline
                                    ? "bg-green-600 hover:bg-green-500 text-white hover:shadow-lg hover:shadow-green-500/25"
                                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                                }`}
                            title={isOtherOnline ? "Start video call" : "User is offline"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
>>>>>>> ed5922e (feat vedio call implementation)
                {roomMessages.map((msg, index) => {
                    const isMe = String(msg.sender_id || msg.user_id) === String(user?.id);
                    return (
                        <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
<<<<<<< HEAD
                            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe ? "bg-green-600 text-white" : "bg-gray-800 text-gray-200"
                                }`}>
                                <div className="text-xs opacity-75 mb-1">{msg.sender_name}</div>
                                <p>{msg.content}</p>
                                <div className="text-xs opacity-50 text-right mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
=======
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe
                                    ? "bg-green-600 text-white rounded-br-sm"
                                    : "bg-gray-800 text-gray-200 rounded-bl-sm"
                                }`}>
                                {!isMe && (
                                    <div className="text-xs font-medium opacity-75 mb-1">
                                        {msg.sender_name}
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                    <span className="text-[10px] opacity-50">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                    {/* Read receipt for sent messages */}
                                    {isMe && isDM && (
                                        <span className={`text-[10px] ${msg.is_read ? "text-blue-300" : "opacity-50"}`}>
                                            {msg.is_read ? "✓✓" : "✓"}
                                        </span>
                                    )}
>>>>>>> ed5922e (feat vedio call implementation)
                                </div>
                            </div>
                        </div>
                    );
                })}
<<<<<<< HEAD
=======

                {/* Typing indicator */}
                {typingNames.length > 0 && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                </div>
                                <span className="text-xs">{typingNames.join(", ")} typing...</span>
                            </div>
                        </div>
                    </div>
                )}

>>>>>>> ed5922e (feat vedio call implementation)
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
<<<<<<< HEAD
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:border-green-500"
                />
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors"
=======
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-full px-4 py-2.5 focus:outline-none focus:border-green-500 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`rounded-full p-2.5 w-10 h-10 flex items-center justify-center transition-all ${input.trim()
                            ? "bg-green-600 hover:bg-green-500 text-white hover:shadow-lg hover:shadow-green-500/25"
                            : "bg-gray-700 text-gray-500"
                        }`}
>>>>>>> ed5922e (feat vedio call implementation)
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
