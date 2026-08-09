import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore safely using specified databaseId and auto-detect long polling
let db: ReturnType<typeof getFirestore>;
const databaseId = firebaseConfig.firestoreDatabaseId || undefined;

try {
  // Use experimentalAutoDetectLongPolling to ensure reliable connections in iframe/proxy environments
  db = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    databaseId
  );
} catch {
  try {
    db = getFirestore(app, databaseId);
  } catch (e) {
    console.warn('Fallback to default Firestore database instance:', e);
    db = getFirestore(app);
  }
}

/**
 * Utility to sanitize objects for Firestore write operations.
 * Removes all `undefined` values recursively to avoid Firestore schema errors.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      sanitized[key] = sanitizeForFirestore(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export { app, db };

