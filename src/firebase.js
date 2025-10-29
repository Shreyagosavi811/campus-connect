// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { signInWithEmailAndPassword } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA6y6YEU7OMEP8_B2vkPIzlX1VULjH4Des",
  authDomain: "campus-connect-16043.firebaseapp.com",
  projectId: "campus-connect-16043",
  storageBucket: "campus-connect-16043.firebasestorage.app",
  messagingSenderId: "904462470143",
  appId: "1:904462470143:web:c33678621e2400d789f5ca",
  measurementId: "G-R8SMJSF81R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

// Login & Logout functions
export const login = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);


export const storage = getStorage(app);

export { signInWithEmailAndPassword };
