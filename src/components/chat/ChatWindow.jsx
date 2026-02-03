import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getChatMessages } from "../../api/chat.api";
import { setMessages } from "../../store/slices/chatSlice";

const ChatWindow = ({ sendMessage }) => {
    const dispatch = useDispatch();
    const { activeRoom, messages } = useSelector(state => state.chat);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const { user } = useSelector(state => state.auth);

    const roomMessages = activeRoom ? messages[activeRoom.id] || [] : [];

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

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    if (!activeRoom) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-950 text-gray-500">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Welcome to EduFlow Chat</h3>
                    <p>Select a course room to start messaging.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-gray-950 h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900">
                <h3 className="text-lg font-bold text-white">{activeRoom.course_title || activeRoom.name}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {roomMessages.map((msg, index) => {
                    const isMe = msg.sender_name === user?.full_name || msg.sender === user?.email || false;
                    return (
                        <div key={msg.id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe ? "bg-green-600 text-white" : "bg-gray-800 text-gray-200"
                                }`}>
                                <div className="text-xs opacity-75 mb-1">{msg.sender_name}</div>
                                <p>{msg.content}</p>
                                <div className="text-xs opacity-50 text-right mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:border-green-500"
                />
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors"
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
