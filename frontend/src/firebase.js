import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyApBCWEXiMzX1LZMa1wrCx6Z7eSI1S_ziQ",
  authDomain: "kimayaayurveda-51482.firebaseapp.com",
  projectId: "kimayaayurveda-51482",
  storageBucket: "kimayaayurveda-51482.firebasestorage.app",
  messagingSenderId: "677059899305",
  appId: "1:677059899305:web:a3726e7bbb1a1ebda99eb8",
  measurementId: "G-B6236MEGN3"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export { app, messaging, getToken, onMessage };
