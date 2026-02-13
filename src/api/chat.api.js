/**
 * Chat API functions
 */
import api from "./axios";

/**
 * Get the current access token for WebSocket authentication.
 */
export const getWebSocketToken = async () => {
    const response = await api.get("/accounts/ws-token/");
    return response.data.data.token;
};

// --- Room APIs ---

export const getChatRooms = async (type = null) => {
    const params = type ? { type } : {};
    const response = await api.get("/chat/rooms/", { params });
    return response.data;
};

export const getChatMessages = async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages/`);
    return response.data;
};

// --- DM APIs ---

export const createDM = async (targetUserId) => {
    const response = await api.post("/chat/rooms/dm/create/", {
        target_user_id: targetUserId,
    });
    return response.data;
};

// --- Call APIs ---

export const getCallHistory = async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/calls/`);
    return response.data;
};
