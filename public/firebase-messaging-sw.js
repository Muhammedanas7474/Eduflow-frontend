// Firebase Cloud Messaging Service Worker
// This MUST be at the root of the public directory

importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDEsUoKsqgqOdmUqnSu6ijL0C3Y3F6risU",
  authDomain: "eduflow-notifications.firebaseapp.com",
  projectId: "eduflow-notifications",
  storageBucket: "eduflow-notifications.firebasestorage.app",
  messagingSenderId: "748889960440",
  appId: "1:748889960440:web:f523ddd820fef05ef2700d"
});

const messaging = firebase.messaging();

// Handle background messages (when tab is not focused)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const notificationTitle = payload.notification?.title || "EduFlow";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
