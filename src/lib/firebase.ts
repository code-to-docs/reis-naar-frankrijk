import { browser } from "$app/environment";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
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
