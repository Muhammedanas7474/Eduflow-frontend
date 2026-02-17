// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDEsUoKsqgqOdmUqnSu6ijL0C3Y3F6risU",
    authDomain: "eduflow-notifications.firebaseapp.com",
    projectId: "eduflow-notifications",
    storageBucket: "eduflow-notifications.firebasestorage.app",
    messagingSenderId: "748889960440",
    appId: "1:748889960440:web:f523ddd820fef05ef2700d"
};

console.log("🔥 Initializing Firebase with config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
    try {
        const currentToken = await getToken(messaging, { vapidKey: 'BHYCbnCnNmvQZSY8KQVbeB1ObHExDHENUtULy3ZpjF03kCk8Q5Z67gUye7yOb7YZBLRiGCxaNwYwhAVRG5lTAjo' });
        if (currentToken) {
            console.log('🔥 current token for client: ', currentToken);
        } else {
            console.log('🔥 No registration token available. Request permission to generate one.');
        }
    } catch (err) {
        console.log('🔥 An error occurred while retrieving token. ', err);
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
