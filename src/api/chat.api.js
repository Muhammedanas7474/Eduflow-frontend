/**
 * Chat API functions
 */
import api from "./axios";

/**
 * Get the current access token for WebSocket authentication.
<<<<<<< HEAD
 * Since the access token is stored in an HTTP-only cookie,
 * we need a special endpoint that returns the token value.
=======
>>>>>>> ed5922e (feat vedio call implementation)
 */
export const getWebSocketToken = async () => {
    const response = await api.get("/accounts/ws-token/");
    return response.data.data.token;
};

<<<<<<< HEAD
// --- New Persistent Chat APIs ---

export const getChatRooms = async () => {
    const response = await api.get("/chat/rooms/");
=======
// --- Room APIs ---

export const getChatRooms = async (type = null) => {
    const params = type ? { type } : {};
    const response = await api.get("/chat/rooms/", { params });
>>>>>>> ed5922e (feat vedio call implementation)
    return response.data;
};

export const getChatMessages = async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages/`);
    return response.data;
};

<<<<<<< HEAD
export const createDM = async (userId) => {
    const response = await api.post("/chat/rooms/create_dm/", { user_id: userId });
=======
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
>>>>>>> ed5922e (feat vedio call implementation)
    return response.data;
};
