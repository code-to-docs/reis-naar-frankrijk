import { browser } from "$app/environment";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

function requiredPublicEnv(key: keyof ImportMetaEnv): string {
  const value = String(import.meta.env[key] || "").trim();
  if (!value) {
    throw new Error(`Missing required Firebase env var: ${key}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: requiredPublicEnv("PUBLIC_FIREBASE_API_KEY"),
  authDomain: requiredPublicEnv("PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requiredPublicEnv("PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requiredPublicEnv("PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requiredPublicEnv("PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requiredPublicEnv("PUBLIC_FIREBASE_APP_ID")
};

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
