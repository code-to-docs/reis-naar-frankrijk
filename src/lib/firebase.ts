import { browser } from "$app/environment";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyAfaEBeJZ6PddCxsyxJfo4pkQLjXsPi0x8",
  authDomain: "reisfrankijk.firebaseapp.com",
  projectId: "reisfrankijk",
  storageBucket: "reisfrankijk.firebasestorage.app",
  messagingSenderId: "182654238849",
  appId: "1:182654238849:web:3e3890d7c6e5dd1bef0d80"
};

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || fallbackFirebaseConfig.appId
};

if (browser && (!import.meta.env.PUBLIC_FIREBASE_API_KEY || !import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || !import.meta.env.PUBLIC_FIREBASE_APP_ID)) {
  console.warn("Firebase env vars incompleet in Vercel; fallback-config uit code wordt gebruikt.");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createDb() {
  // localCache werkt alleen in de browser; op SSR altijd reguliere Firestore instance gebruiken.
  if (!browser) return getFirestore(app);

  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createDb();
