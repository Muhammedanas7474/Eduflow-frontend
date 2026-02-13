import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    rooms: [],
    activeRoom: null,
    messages: {},          // { [roomId]: [messages] }
    unreadCounts: {},      // { [roomId]: count }
    onlineUsers: [],       // [userId, userId, ...]
    typingUsers: {},       // { [roomId]: { userId: fullName } }
    isLoading: false,
    isConnected: false,
    // Video call state
    incomingCall: null,    // { callerId, callerName, sdp, callId }
    activeCall: null,      // { callId, roomId, remoteUserId }
    callStatus: null,      // 'ringing' | 'active' | 'ended' | null
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setRooms: (state, action) => {
            state.rooms = action.payload;
            action.payload.forEach(room => {
                state.unreadCounts[room.id] = room.unread_count || 0;
            });
        },
        setActiveRoom: (state, action) => {
            state.activeRoom = action.payload;
            if (action.payload) {
                state.unreadCounts[action.payload.id] = 0;
            }
        },
        setMessages: (state, action) => {
            const { roomId, messages } = action.payload;
            state.messages[roomId] = messages;
        },
        addMessage: (state, action) => {
            const { roomId, message } = action.payload;
            if (!state.messages[roomId]) {
                state.messages[roomId] = [];
            }
            // Prevent duplicate messages
            const exists = state.messages[roomId].some(m => m.id === message.id);
            if (!exists) {
                state.messages[roomId].push(message);
            }

            // Update last message in room list
            const roomIndex = state.rooms.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                state.rooms[roomIndex].last_message = message;
                state.rooms[roomIndex].last_activity = message.created_at;

                // Move room to top
                const room = state.rooms.splice(roomIndex, 1)[0];
                state.rooms.unshift(room);

                // Increment unread if not active
                if (state.activeRoom?.id !== roomId) {
                    state.unreadCounts[roomId] = (state.unreadCounts[roomId] || 0) + 1;
                }
            }
        },
        updateConnectionStatus: (state, action) => {
            state.isConnected = action.payload;
        },

        // --- Online / Presence ---
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setUserOnline: (state, action) => {
            const userId = action.payload;
            if (!state.onlineUsers.includes(userId)) {
                state.onlineUsers.push(userId);
            }
        },
        setUserOffline: (state, action) => {
            const userId = action.payload;
            state.onlineUsers = state.onlineUsers.filter(id => id !== userId);
        },

        // --- Typing ---
        setUserTyping: (state, action) => {
            const { roomId, userId, fullName, isTyping } = action.payload;
            if (!state.typingUsers[roomId]) {
                state.typingUsers[roomId] = {};
            }
            if (isTyping) {
                state.typingUsers[roomId][userId] = fullName;
            } else {
                delete state.typingUsers[roomId][userId];
            }
        },

        // --- Read Receipts ---
        markMessageRead: (state, action) => {
            const { roomId, messageId } = action.payload;
            if (state.messages[roomId]) {
                const msg = state.messages[roomId].find(m => m.id === messageId);
                if (msg) {
                    msg.is_read = true;
                }
            }
        },

        // --- Video Call ---
        setIncomingCall: (state, action) => {
            state.incomingCall = action.payload;
            state.callStatus = action.payload ? "ringing" : null;
        },
        setActiveCall: (state, action) => {
            state.activeCall = action.payload;
            state.callStatus = action.payload ? "active" : null;
            state.incomingCall = null;
        },
        endCall: (state) => {
            state.activeCall = null;
            state.incomingCall = null;
            state.callStatus = null;
        },

        // --- Add DM Room to list ---
        addRoom: (state, action) => {
            const room = action.payload;
            const exists = state.rooms.some(r => r.id === room.id);
            if (!exists) {
                state.rooms.unshift(room);
            }
        },
    },
});

export const {
    setRooms,
    setActiveRoom,
    setMessages,
    addMessage,
    updateConnectionStatus,
    setOnlineUsers,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    markMessageRead,
    setIncomingCall,
    setActiveCall,
    endCall,
    addRoom,
} = chatSlice.actions;

export default chatSlice.reducer;
