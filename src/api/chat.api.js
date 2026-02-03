/**
 * Chat API functions
 */
import api from "./axios";

/**
 * Get the current access token for WebSocket authentication.
 * Since the access token is stored in an HTTP-only cookie,
 * we need a special endpoint that returns the token value.
 */
export const getWebSocketToken = async () => {
    const response = await api.get("/accounts/ws-token/");
    return response.data.data.token;
};

// --- New Persistent Chat APIs ---

export const getChatRooms = async () => {
    const response = await api.get("/chat/rooms/");
    return response.data;
};

export const getChatMessages = async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages/`);
    return response.data;
};

export const createDM = async (userId) => {
    const response = await api.post("/chat/rooms/create_dm/", { user_id: userId });
    return response.data;
};
