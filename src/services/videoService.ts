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

const SEED_VIDEOS: Omit<VideoItem, 'id'>[] = [];

export function subscribeToVideos(callback: (videos: VideoItem[]) => void): () => void {
  const colRef = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
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

      callback(videos);
    },
    (error) => {
      console.error('Error listening to videos collection:', error);
      callback([]);
    }
  );

  return unsubscribe;
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
  const colRef = collection(db, COLLECTION_NAME);
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

  const sanitized = sanitizeForFirestore(newItem);
  const docRef = await addDoc(colRef, sanitized);
  return docRef.id;
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
  const colRef = collection(db, COLLECTION_NAME);
  const ids: string[] = [];

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

    const sanitized = sanitizeForFirestore(newItem);
    const docRef = await addDoc(colRef, sanitized);
    ids.push(docRef.id);
  }

  return ids;
}

export async function updateVideoInFirestore(
  id: string,
  updates: Partial<Omit<VideoItem, 'id'>>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const sanitized = sanitizeForFirestore(updates);
  await updateDoc(docRef, sanitized);
}

export async function deleteVideoFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function deleteAllVideosFromFirestore(): Promise<void> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error('Failed to delete all videos from Firestore:', err);
  }
}

export async function incrementVideoViews(id: string, currentViews: number): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { views: currentViews + 1 });
  } catch (err) {
    console.warn('Could not increment views', err);
  }
}

export async function toggleVideoLike(id: string, currentLikes: number, isLiking: boolean): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const newLikes = isLiking ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    await updateDoc(docRef, { likes: newLikes });
  } catch (err) {
    console.warn('Could not toggle video like', err);
  }
}

