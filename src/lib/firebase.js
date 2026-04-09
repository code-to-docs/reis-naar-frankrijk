import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  // ⬇️ PLAK HIER JOUW FIREBASE CONFIG ⬇️
  apiKey: "AIzaSyAfaEBeJZ6PddCxsyxJfo4pkQLjXsPi0x8",
  authDomain: "reisfrankijk.firebaseapp.com",
  projectId: "reisfrankijk",
  storageBucket: "reisfrankijk.firebasestorage.app",
  messagingSenderId: "182654238849",
  appId: "1:182654238849:web:3e3890d7c6e5dd1bef0d80"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
