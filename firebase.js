// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmgD4JPlAgBYVyMEVhO0JeuuJi0Z4vbpU",
  authDomain: "pantry-tracker-49c8f.firebaseapp.com",
  projectId: "pantry-tracker-49c8f",
  storageBucket: "pantry-tracker-49c8f.appspot.com",
  messagingSenderId: "947188426655",
  appId: "1:947188426655:web:52aae22a0bd5cf8546ffaa",
  measurementId: "G-229E46GEKC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}