// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPZXdYMcBZLlCiudhUjzFaHc8fpdAtb5w",
  authDomain: "codehat-b131d.firebaseapp.com",
  projectId: "codehat-b131d",
  storageBucket: "codehat-b131d.firebasestorage.app",
  messagingSenderId: "978926227953",
  appId: "1:978926227953:web:bae73164665876eb8db450",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


export {auth, db};
