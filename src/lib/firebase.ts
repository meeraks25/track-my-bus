// Centralized Firebase config for bus tracking (dummy values)
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyDp-7vy2-NNElrdKr0z97scXE-ypD5apxs",
    authDomain: "track-my-bus-a3114.firebaseapp.com",
    databaseURL: "https://track-my-bus-a3114-default-rtdb.firebaseio.com",
    projectId: "track-my-bus-a3114",
    storageBucket: "track-my-bus-a3114.appspot.com",
    messagingSenderId: "558200900694",
    appId: "1:558200900694:web:fa0ce65b81bf5da0bbfff7",
    measurementId: "G-YBQZWX19F8"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database, ref, set, onValue }; 