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
