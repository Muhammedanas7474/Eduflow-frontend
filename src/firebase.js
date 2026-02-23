import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api/axios"; // Use our authenticated axios instance

const firebaseConfig = {
    apiKey: "AIzaSyDEsUoKsqgqOdmUqnSu6ijL0C3Y3F6risU",
    authDomain: "eduflow-notifications.firebaseapp.com",
    projectId: "eduflow-notifications",
    storageBucket: "eduflow-notifications.firebasestorage.app",
    messagingSenderId: "748889960440",
    appId: "1:748889960440:web:f523ddd820fef05ef2700d"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Valid VAPID Key from previous configuration
const VAPID_KEY = 'BHYCbnCnNmvQZSY8KQVbeB1ObHExDHENUtULy3ZpjF03kCk8Q5Z67gUye7yOb7YZBLRiGCxaNwYwhAVRG5lTAjo';

export const requestForToken = async () => {
    try {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            const currentToken = await getToken(messaging, {
                vapidKey: VAPID_KEY,
            });

            if (currentToken) {
                console.log("🔥 FCM Token:", currentToken);

                // Send token to backend using authenticated API
                try {
                    await api.post("/notifications/save-device-token/", {
                        token: currentToken
                    });
                    console.log("Token sent to backend ✅");
                } catch (apiErr) {
                    console.error("Failed to send token to backend:", apiErr);
                }
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        }
    } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log("🔥 Message received. ", payload);
            resolve(payload);
        });
    });

export default app;
