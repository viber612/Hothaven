import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import { VideoItem } from '../types/video';
import { generateRandomStats, getLikePercentage } from '../utils/formatters';
import { parseVideoUrl } from '../utils/videoParser';

const COLLECTION_NAME = 'videos';
const CACHE_KEY = 'hothaven_cached_videos';
const DELETED_IDS_KEY = 'hothaven_deleted_video_ids';

function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedId(id: string): void {
  try {
    const set = getDeletedIds();
    set.add(id);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore storage errors
  }
}

function clearDeletedIds(): void {
  try {
    localStorage.removeItem(DELETED_IDS_KEY);
  } catch {
    // ignore
  }
}

function normalizeVideoRecord(raw: any, docId?: string): VideoItem | null {
  if (!raw || typeof raw !== 'object') return null;
  // Always prioritize the actual Firestore document ID (docId) over any inner raw.id
  const id =
    typeof docId === 'string' && docId.trim()
      ? docId.trim()
      : typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : '';
  if (!id) return null;

  let views = typeof raw.views === 'number' && Number.isFinite(raw.views) ? raw.views : 0;
  let likes = typeof raw.likes === 'number' && Number.isFinite(raw.likes) ? raw.likes : 0;
  let likePercentage =
    typeof raw.likePercentage === 'number' && Number.isFinite(raw.likePercentage)
      ? raw.likePercentage
      : 0;

  if (views < 200_000) {
    const stats = generateRandomStats();
    views = stats.views;
    likePercentage = stats.likePercentage;
    likes = stats.likes;
  } else if (!likePercentage || likePercentage <= 0) {
    likePercentage = getLikePercentage({ views, likes });
  }

  const parsedSource = parseVideoUrl(raw.embedUrl || raw.url || '');

  return {
    id,
    title: raw.title || parsedSource.suggestedTitle || 'Untitled Video',
    url: raw.url || '',
    embedUrl: parsedSource.embedUrl || raw.embedUrl || raw.url || '',
    videoType: raw.videoType || parsedSource.videoType || 'embed',
    provider: raw.provider || parsedSource.provider || 'Web Stream',
    thumbnail: raw.thumbnail || parsedSource.suggestedThumbnail || '',
    category: raw.category || 'HD Videos',
    duration: raw.duration || parsedSource.suggestedDuration || '14:20',
    views,
    likes,
    likePercentage,
    isFeatured: Boolean(raw.isFeatured),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function getLocalCachedVideos(): VideoItem[] {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    const deleted = getDeletedIds();
    return parsed
      .map((item) => normalizeVideoRecord(item))
      .filter((item): item is VideoItem => item !== null && !deleted.has(item.id));
  } catch {
    return [];
  }
}

function setLocalCachedVideos(videos: VideoItem[]): void {
  try {
    const deleted = getDeletedIds();
    const valid = videos
      .map((item) => normalizeVideoRecord(item, item.id))
      .filter((item): item is VideoItem => item !== null && !deleted.has(item.id));
    localStorage.setItem(CACHE_KEY, JSON.stringify(valid));
  } catch (err) {
    console.warn('Unable to cache videos locally', err);
  }
}

export function subscribeToVideos(callback: (videos: VideoItem[]) => void): () => void {
  // First emit cached videos immediately for instant loading
  const initialCache = getLocalCachedVideos();
  if (initialCache.length > 0) {
    callback(initialCache);
  }

  if (!db) {
    callback(initialCache);
    return () => {};
  }

  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          setLocalCachedVideos([]);
          callback([]);
          return;
        }

        const deleted = getDeletedIds();
        const videos: VideoItem[] = snapshot.docs
          .map((docSnap) => normalizeVideoRecord(docSnap.data(), docSnap.id))
          .filter((item): item is VideoItem => item !== null && !deleted.has(item.id));

        // Sort by createdAt descending
        videos.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setLocalCachedVideos(videos);
        callback(videos);
      },
      (error) => {
        console.warn(
          'Firestore subscription notice (using offline cache):',
          error?.message || error
        );
        const fallback = getLocalCachedVideos();
        callback(fallback);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Unable to subscribe to Firestore, using offline cache:', err);
    callback(initialCache);
    return () => {};
  }
}

export async function seedDefaultVideos(): Promise<void> {
  // Demo video seeding disabled
}

export async function addVideoToFirestore(
  videoData: Omit<VideoItem, 'id' | 'views' | 'likes' | 'createdAt'> & {
    views?: number;
    likes?: number;
    likePercentage?: number;
  }
): Promise<VideoItem> {
  const stats = generateRandomStats();

  const finalViews =
    typeof videoData.views === 'number' && videoData.views >= 200_000
      ? videoData.views
      : stats.views;
  const finalLikePercentage =
    typeof videoData.likePercentage === 'number' && videoData.likePercentage > 0
      ? videoData.likePercentage
      : stats.likePercentage;
  const finalLikes =
    typeof videoData.likes === 'number' && videoData.likes > 0
      ? videoData.likes
      : Math.round(finalViews * (finalLikePercentage / 100));

  const newItem = {
    ...videoData,
    views: finalViews,
    likes: finalLikes,
    likePercentage: finalLikePercentage,
    createdAt: new Date().toISOString(),
  };

  const tempId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const createdItem: VideoItem = { id: tempId, ...newItem };
  const cached = getLocalCachedVideos();
  setLocalCachedVideos([createdItem, ...cached]);

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const sanitized = sanitizeForFirestore(newItem);
    const docRef = await addDoc(colRef, sanitized);

    const finalItem: VideoItem = { ...createdItem, id: docRef.id };
    const updated = getLocalCachedVideos().map((v) =>
      v.id === tempId ? finalItem : v
    );
    setLocalCachedVideos(updated);
    return finalItem;
  } catch (err) {
    console.warn('Firestore offline/write notice (saved to local cache):', err);
    return createdItem;
  }
}

export async function batchAddVideosToFirestore(
  videosData: Array<
    Omit<VideoItem, 'id' | 'views' | 'likes' | 'createdAt'> & {
      views?: number;
      likes?: number;
      likePercentage?: number;
    }
  >
): Promise<VideoItem[]> {
  const createdItems: VideoItem[] = [];

  for (const videoData of videosData) {
    const stats = generateRandomStats();
    const finalViews =
      typeof videoData.views === 'number' && videoData.views >= 200_000
        ? videoData.views
        : stats.views;
    const finalLikePercentage =
      typeof videoData.likePercentage === 'number' && videoData.likePercentage > 0
        ? videoData.likePercentage
        : stats.likePercentage;
    const finalLikes =
      typeof videoData.likes === 'number' && videoData.likes > 0
        ? videoData.likes
        : Math.round(finalViews * (finalLikePercentage / 100));

    const newItem = {
      ...videoData,
      views: finalViews,
      likes: finalLikes,
      likePercentage: finalLikePercentage,
      createdAt: new Date().toISOString(),
    };

    const tempId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    try {
      const colRef = collection(db, COLLECTION_NAME);
      const sanitized = sanitizeForFirestore(newItem);
      const docRef = await addDoc(colRef, sanitized);
      createdItems.push({ id: docRef.id, ...newItem });
    } catch (err) {
      console.warn('Firestore batch write notice:', err);
      createdItems.push({ id: tempId, ...newItem });
    }
  }

  const existing = getLocalCachedVideos();
  setLocalCachedVideos([...createdItems, ...existing]);

  return createdItems;
}

export async function updateVideoInFirestore(
  id: string,
  updates: Partial<Omit<VideoItem, 'id'>>
): Promise<void> {
  const cached = getLocalCachedVideos();
  setLocalCachedVideos(
    cached.map((v) => (v.id === id ? { ...v, ...updates } : v))
  );

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const sanitized = sanitizeForFirestore(updates);
    await updateDoc(docRef, sanitized);
  } catch (err) {
    console.warn('Firestore update notice (cached locally):', err);
  }
}

export async function deleteVideoFromFirestore(id: string): Promise<void> {
  addDeletedId(id);
  const cached = getLocalCachedVideos();
  setLocalCachedVideos(cached.filter((v) => v.id !== id));

  if (!db) return;

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (err) {
    console.warn('Firestore direct delete notice:', err);
  }

  // Also check if any document has an internal `id` field matching `id`
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const matchingDocs = snapshot.docs.filter(
      (docSnap) => docSnap.id === id || docSnap.data()?.id === id
    );
    await Promise.all(
      matchingDocs.map((docSnap) => deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)))
    );
  } catch (err) {
    console.warn('Firestore cleanup check notice:', err);
  }
}

export async function deleteAllVideosFromFirestore(): Promise<void> {
  setLocalCachedVideos([]);
  if (!db) return;
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    snapshot.docs.forEach((docSnap) => addDeletedId(docSnap.id));
    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, COLLECTION_NAME, docSnap.id))
    );
    await Promise.all(deletePromises);
    clearDeletedIds();
  } catch (err) {
    console.warn('Firestore clear catalog notice:', err);
  }
}

export async function incrementVideoViews(id: string, currentViews: number): Promise<void> {
  const safeCurrent = typeof currentViews === 'number' && Number.isFinite(currentViews) ? currentViews : 200_000;
  const cached = getLocalCachedVideos();
  setLocalCachedVideos(
    cached.map((v) => (v.id === id ? { ...v, views: safeCurrent + 1 } : v))
  );

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { views: safeCurrent + 1 });
  } catch (err) {
    console.warn('Could not increment views on Firestore:', err);
  }
}

export async function toggleVideoLike(
  id: string,
  currentLikes: number,
  isLiking: boolean
): Promise<void> {
  const safeCurrent = typeof currentLikes === 'number' && Number.isFinite(currentLikes) ? currentLikes : 190_000;
  const newLikes = isLiking ? safeCurrent + 1 : Math.max(0, safeCurrent - 1);
  const cached = getLocalCachedVideos();
  setLocalCachedVideos(
    cached.map((v) => (v.id === id ? { ...v, likes: newLikes } : v))
  );

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { likes: newLikes });
  } catch (err) {
    console.warn('Could not toggle video like on Firestore:', err);
  }
}
