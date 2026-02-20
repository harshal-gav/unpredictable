import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTsPmQ2ZZyxXZKR3usP3bg9_mcAmqWQHk",
    authDomain: "unpredictable-runner.firebaseapp.com",
    projectId: "unpredictable-runner",
    storageBucket: "unpredictable-runner.firebasestorage.app",
    messagingSenderId: "1015090295371",
    appId: "1:1015090295371:web:3600d75319890fca8113ce",
    measurementId: "G-PN7EV93WLT"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
