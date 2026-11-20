import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ImagePlus, Lock, LogOut, Trash2, Upload, X } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { resizeImageFile } from './utils/thumbnail';
import { addVideoToFirestore, deleteVideoFromFirestore } from './services/videoService';
import { VideoItem } from './types/video';
import './index.css';

const COLLECTION = 'videos';

export default function App() {
  const [images, setImages] = useState<VideoItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedImage, setSelectedImage] = useState<VideoItem | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const logoTapCount = useRef(0);
  const lastLogoTap = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!db) return;
    const imageQuery = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(imageQuery, (snapshot) => {
      const records = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() } as VideoItem))
        .filter((item) => Boolean(item.thumbnail));
      setImages(records);
    }, () => setError('Unable to load the gallery right now.'));
  }, []);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (user) => setIsAdmin(Boolean(user)));
  }, []);

  const handleLogoTap = () => {
    const now = Date.now();
    logoTapCount.current = now - lastLogoTap.current < 700 ? logoTapCount.current + 1 : 1;
    lastLogoTap.current = now;
    if (logoTapCount.current >= 3) {
      logoTapCount.current = 0;
      setShowAdmin(true);
      setError('');
      setMessage('');
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      if (!auth) throw new Error('Firebase Authentication is unavailable.');
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setEmail('');
      setPassword('');
      setMessage('Admin access granted.');
    } catch {
      setError('Sign-in failed. Check the admin email and password.');
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setError('');
    setMessage('');
    setIsUploading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const image = await resizeImageFile(file, 1400, 1400, 0.86);
        await addVideoToFirestore({
          title: file.name.replace(/\.[^/.]+$/, '') || 'Gallery image',
          url: '',
          embedUrl: '',
          videoType: 'html5',
          provider: 'Uploaded image',
          thumbnail: image,
          category: 'Gallery',
          duration: '',
          isFeatured: false,
        });
      }
      setMessage(`${files.length} image${files.length === 1 ? '' : 's'} added to the gallery.`);
    } catch {
      setError('Upload failed. Try a smaller image or fewer files.');
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleDelete = async (image: VideoItem) => {
    if (!window.confirm(`Delete “${image.title}” from the gallery?`)) return;
    try {
      await deleteVideoFromFirestore(image.id);
      setMessage('Image deleted.');
    } catch {
      setError('Could not delete that image.');
    }
  };

  const sortedImages = useMemo(() => images, [images]);

  return (
    <main className="gallery-page">
      <header className="gallery-header">
        <button className="brand-button" onClick={handleLogoTap} aria-label="Open admin panel">
          <span className="brand-mark">H</span>
          <span>HOTHAVEN</span>
        </button>
        <span className="gallery-caption">Image gallery</span>
      </header>

      <section className="gallery-content">
        <div className="gallery-heading">
          <div>
            <p className="eyebrow">Shared collection</p>
            <h1>Gallery</h1>
          </div>
          <p className="gallery-count">{sortedImages.length} image{sortedImages.length === 1 ? '' : 's'}</p>
        </div>

        {sortedImages.length === 0 ? (
          <div className="empty-gallery">
            <ImagePlus size={34} strokeWidth={1.5} />
            <h2>No images yet</h2>
            <p>The admin can add images from a computer. New uploads appear here for everyone.</p>
          </div>
        ) : (
          <div className="image-grid">
            {sortedImages.map((image) => (
              <article className="image-card" key={image.id}>
                <button className="image-button" onClick={() => setSelectedImage(image)} aria-label={`View ${image.title}`}>
                  <img src={image.thumbnail} alt={image.title} loading="lazy" />
                </button>
                {isAdmin && (
                  <button className="delete-image" onClick={() => void handleDelete(image)} aria-label={`Delete ${image.title}`}>
                    <Trash2 size={15} />
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedImage && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setSelectedImage(null)}>
          <button className="close-lightbox" onClick={() => setSelectedImage(null)} aria-label="Close image"><X /></button>
          <img src={selectedImage.thumbnail} alt={selectedImage.title} onClick={(event) => event.stopPropagation()} />
        </div>
      )}

      {showAdmin && (
        <div className="admin-overlay" role="dialog" aria-modal="true">
          <section className="admin-panel">
            <button className="close-admin" onClick={() => setShowAdmin(false)} aria-label="Close admin panel"><X /></button>
            {!isAdmin ? (
              <>
                <div className="admin-icon"><Lock size={22} /></div>
                <p className="eyebrow">Private area</p>
                <h2>Admin access</h2>
                <p className="admin-copy">Sign in to add images from your computer and manage the shared gallery.</p>
                <form onSubmit={handleLogin} className="admin-form">
                  <input type="email" placeholder="Admin email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
                  <input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
                  <button className="primary-button" type="submit">Unlock gallery</button>
                </form>
              </>
            ) : (
              <>
                <div className="admin-panel-heading">
                  <div><p className="eyebrow">Content manager</p><h2>Add images</h2></div>
                  <button className="secondary-button" onClick={() => void signOut(auth!)}><LogOut size={15} /> Lock</button>
                </div>
                <p className="admin-copy">Choose one or more images from your computer. They are resized and saved to the shared Firestore gallery for all viewers.</p>
                <input ref={fileInput} type="file" accept="image/*" multiple onChange={(event) => void handleUpload(event)} hidden />
                <button className="upload-dropzone" onClick={() => fileInput.current?.click()} disabled={isUploading}>
                  <Upload size={25} />
                  <strong>{isUploading ? 'Uploading images…' : 'Choose images from computer'}</strong>
                  <span>JPG, PNG, WEBP · multiple files supported</span>
                </button>
              </>
            )}
            {(error || message) && <p className={error ? 'status-error' : 'status-message'}>{error || message}</p>}
          </section>
        </div>
      )}
    </main>
  );
}
