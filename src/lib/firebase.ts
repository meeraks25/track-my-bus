import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace these values with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyDp-7vy2-NNElrdKr0z97scXE-ypD5apxs",
    authDomain: "track-my-bus-a3114.firebaseapp.com",
    databaseURL: "https://track-my-bus-a3114-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "track-my-bus-a3114",
    storageBucket: "track-my-bus-a3114.firebasestorage.app",
    messagingSenderId: "558200900694",
    appId: "1:558200900694:web:fa0ce65b81bf5da0bbfff7",
    measurementId: "G-YBQZWX19F8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
