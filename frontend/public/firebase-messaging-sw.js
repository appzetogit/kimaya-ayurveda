// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyApBCWEXiMzX1LZMa1wrCx6Z7eSI1S_ziQ",
  authDomain: "kimayaayurveda-51482.firebaseapp.com",
  projectId: "kimayaayurveda-51482",
  storageBucket: "kimayaayurveda-51482.firebasestorage.app",
  messagingSenderId: "677059899305",
  appId: "1:677059899305:web:a3726e7bbb1a1ebda99eb8",
  measurementId: "G-B6236MEGN3"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/assets/logo.jpeg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
