import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db, sanitizeForFirestore } from '../lib/firebase';
import { VideoItem } from '../types/video';
import { generateRandomStats, getLikePercentage } from '../utils/formatters';

const COLLECTION_NAME = 'videos';
const CACHE_KEY = 'hothaven_cached_videos';

function getLocalCachedVideos(): VideoItem[] {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setLocalCachedVideos(videos: VideoItem[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(videos));
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

        const videos: VideoItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let views = typeof data.views === 'number' ? data.views : 0;
          let likes = typeof data.likes === 'number' ? data.likes : 0;
          let likePercentage = typeof data.likePercentage === 'number' ? data.likePercentage : 0;

          // If a video has 0 or unassigned views, apply realistic randomized views (200K - 10M) and like %
          if (views < 200_000) {
            const stats = generateRandomStats();
            views = stats.views;
            likePercentage = stats.likePercentage;
            likes = stats.likes;
          } else if (!likePercentage || likePercentage <= 0) {
            likePercentage = getLikePercentage({ views, likes });
          }

          return {
            id: docSnap.id,
            title: data.title || 'Untitled Video',
            url: data.url || '',
            embedUrl: data.embedUrl || data.url || '',
            videoType: data.videoType || 'embed',
            provider: data.provider || 'Web Stream',
            thumbnail: data.thumbnail || '',
            category: data.category || 'HD Videos',
            duration: data.duration || '',
            views,
            likes,
            likePercentage,
            isFeatured: Boolean(data.isFeatured),
            createdAt: data.createdAt || new Date().toISOString(),
          };
        });

        // Sort by createdAt descending
        videos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setLocalCachedVideos(videos);
        callback(videos);
      },
      (error) => {
        console.warn('Firestore subscription notice (using offline cache):', error?.message || error);
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
): Promise<string> {
  const stats = generateRandomStats();

  const finalViews = typeof videoData.views === 'number' && videoData.views >= 200_000 ? videoData.views : stats.views;
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
  const cached = getLocalCachedVideos();
  setLocalCachedVideos([{ id: tempId, ...newItem }, ...cached]);

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const sanitized = sanitizeForFirestore(newItem);
    const docRef = await addDoc(colRef, sanitized);
    
    // Update temporary ID with real Firestore doc ID
    const updated = getLocalCachedVideos().map((v) => (v.id === tempId ? { ...v, id: docRef.id } : v));
    setLocalCachedVideos(updated);
    return docRef.id;
  } catch (err) {
    console.warn('Firestore offline/write notice (saved to local cache):', err);
    return tempId;
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
): Promise<string[]> {
  const ids: string[] = [];
  const newCachedItems: VideoItem[] = [];

  for (const videoData of videosData) {
    const stats = generateRandomStats();
    const finalViews = typeof videoData.views === 'number' && videoData.views >= 200_000 ? videoData.views : stats.views;
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
    newCachedItems.push({ id: tempId, ...newItem });

    try {
      const colRef = collection(db, COLLECTION_NAME);
      const sanitized = sanitizeForFirestore(newItem);
      const docRef = await addDoc(colRef, sanitized);
      ids.push(docRef.id);
    } catch (err) {
      console.warn('Firestore batch write notice:', err);
      ids.push(tempId);
    }
  }

  const existing = getLocalCachedVideos();
  setLocalCachedVideos([...newCachedItems, ...existing]);

  return ids;
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
  const cached = getLocalCachedVideos();
  setLocalCachedVideos(cached.filter((v) => v.id !== id));

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete notice:', err);
  }
}

export async function deleteAllVideosFromFirestore(): Promise<void> {
  setLocalCachedVideos([]);
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Firestore clear catalog notice:', err);
  }
}

export async function incrementVideoViews(id: string, currentViews: number): Promise<void> {
  const cached = getLocalCachedVideos();
  setLocalCachedVideos(
    cached.map((v) => (v.id === id ? { ...v, views: currentViews + 1 } : v))
  );

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { views: currentViews + 1 });
  } catch (err) {
    console.warn('Could not increment views on Firestore:', err);
  }
}

export async function toggleVideoLike(id: string, currentLikes: number, isLiking: boolean): Promise<void> {
  const newLikes = isLiking ? currentLikes + 1 : Math.max(0, currentLikes - 1);
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

