import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: any = null;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.warn('Firebase initialization fallback:', error);
}

let db: any = null;
const databaseId = (firebaseConfig as any)?.firestoreDatabaseId || undefined;
if (app) {
  try {
    db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, databaseId);
  } catch {
    try { db = getFirestore(app, databaseId); } catch { db = getFirestore(app); }
  }
}

let auth: any = null;
if (app) {
  try { auth = getAuth(app); } catch (error) { console.warn('Firebase Auth unavailable:', error); }
}

export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      sanitized[key] = sanitizeForFirestore(value);
    } else sanitized[key] = value;
  }
  return sanitized;
}

export { app, auth, db };
