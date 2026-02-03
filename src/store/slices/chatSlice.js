import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    rooms: [],
    activeRoom: null,
    messages: {}, // { [roomId]: [messages] }
    unreadCounts: {}, // { [roomId]: count }
    isLoading: false,
    isConnected: false,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setRooms: (state, action) => {
            state.rooms = action.payload;
            // Initialize unread counts
            action.payload.forEach(room => {
                state.unreadCounts[room.id] = room.unread_count || 0;
            });
        },
        setActiveRoom: (state, action) => {
            state.activeRoom = action.payload;
            // Clear unread count when entering room
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
            state.messages[roomId].push(message);

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
    },
});

export const { setRooms, setActiveRoom, setMessages, addMessage, updateConnectionStatus } = chatSlice.actions;
export default chatSlice.reducer;
