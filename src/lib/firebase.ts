
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCD5H0G_4X5tjT1k7G9W6GZEZw7QOE4hgA",
  authDomain: "taskflow-74e65.firebaseapp.com",
  projectId: "taskflow-74e65",
  storageBucket: "taskflow-74e65.appspot.com",
  messagingSenderId: "1097057714815",
  appId: "1:1097057714815:web:027743fc91d9e0bb03354a",
  measurementId: "G-DPQ5PCDM7Y"
};


// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
