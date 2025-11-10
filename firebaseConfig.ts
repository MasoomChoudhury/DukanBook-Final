// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "billing-software-74d41.firebaseapp.com",
  projectId: "billing-software-74d41",
  storageBucket: "billing-software-74d41.appspot.com",
  messagingSenderId: "619342921179",
  appId: "1:619342921179:web:df26759b66a056f0bdfbfe",
  measurementId: "G-WG3LJ0XD99"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize Cloud Firestore and get a reference to the service
export const db = firebase.firestore();

// Initialize Firebase Authentication and get a reference to the service
export const auth = firebase.auth();
