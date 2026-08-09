import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  X,
  PlusCircle,
  Edit2,
  Trash2,
  Flame,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Upload,
  Layers,
  FileVideo,
  Eye,
  Heart,
  Plus,
  Tv,
} from 'lucide-react';
import { VideoItem, VideoCategory } from '../types/video';
import { parseVideoUrl, getAutoThumbnail } from '../utils/videoParser';
import { resizeImageFile } from '../utils/thumbnail';
import { formatViews, generateRandomStats } from '../utils/formatters';

interface BatchVideoDraft {
  id: string;
  title: string;
  url: string;
  duration: string;
  thumbnail: string;
  isFeatured: boolean;
  views: number;
  likes: number;
  likePercentage: number;
}

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onAuthenticateAdmin: (pin: string) => boolean;
  onLockAdmin: () => void;
  onPublishVideo: (
    data: Omit<VideoItem, 'id' | 'views' | 'likes' | 'createdAt'> & {
      views?: number;
      likes?: number;
      likePercentage?: number;
    }
  ) => Promise<void>;
  onBatchPublishVideos?: (
    videos: Array<
      Omit<VideoItem, 'id' | 'views' | 'likes' | 'createdAt'> & {
        views?: number;
        likes?: number;
        likePercentage?: number;
      }
    >
  ) => Promise<void>;
  editingVideo: VideoItem | null;
  onUpdateVideo: (id: string, updates: Partial<VideoItem>) => Promise<void>;
  onDeleteVideo: (id: string) => Promise<void>;
  onDeleteAllVideos?: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

function createEmptyBatchSlot(index: number): BatchVideoDraft {
  const stats = generateRandomStats();
  return {
    id: `slot_${Date.now()}_${index}`,
    title: '',
    url: '',
    duration: '15:20',
    thumbnail: '',
    isFeatured: index === 0,
    views: stats.views,
    likes: stats.likes,
    likePercentage: stats.likePercentage,
  };
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onAuthenticateAdmin,
  onLockAdmin,
  onPublishVideo,
  onBatchPublishVideos,
  editingVideo,
  onUpdateVideo,
  onDeleteVideo,
  onDeleteAllVideos,
  showToast,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single Form Fields
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [category, setCategory] = useState<VideoCategory>('HD Videos');
  const [duration, setDuration] = useState('15:00');
  const [thumbnail, setThumbnail] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [singleViews, setSingleViews] = useState(0);
  const [singleLikePercentage, setSingleLikePercentage] = useState(97);
  const [singleLikes, setSingleLikes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Batch Form Fields
  const [batchSlots, setBatchSlots] = useState<BatchVideoDraft[]>(() =>
    Array.from({ length: 10 }, (_, i) => createEmptyBatchSlot(i))
  );
  const [quickPasteText, setQuickPasteText] = useState('');
  const [showQuickPaste, setShowQuickPaste] = useState(false);

  // Populate form if editing existing video
  useEffect(() => {
    if (editingVideo) {
      setActiveTab('single');
      setTitle(editingVideo.title);
      setUrlInput(editingVideo.url);
      setCategory((editingVideo.category as VideoCategory) || 'HD Videos');
      setDuration(editingVideo.duration);
      setThumbnail(editingVideo.thumbnail);
      setIsFeatured(Boolean(editingVideo.isFeatured));
      setSingleViews(editingVideo.views);
      setSingleLikePercentage(editingVideo.likePercentage || 97);
      setSingleLikes(editingVideo.likes);
    } else {
      resetForm();
    }
  }, [editingVideo]);

  const resetForm = () => {
    const stats = generateRandomStats();
    setTitle('');
    setUrlInput('');
    setCategory('HD Videos');
    setDuration('15:00');
    setThumbnail('');
    setIsFeatured(false);
    setSingleViews(stats.views);
    setSingleLikePercentage(stats.likePercentage);
    setSingleLikes(stats.likes);
    setBatchSlots(Array.from({ length: 10 }, (_, i) => createEmptyBatchSlot(i)));
  };

  const rerollSingleStats = () => {
    const stats = generateRandomStats();
    setSingleViews(stats.views);
    setSingleLikePercentage(stats.likePercentage);
    setSingleLikes(stats.likes);
    showToast(`Stats rerolled: ${formatViews(stats.views)} views & ${stats.likePercentage}% likes`, 'info');
  };

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuthenticateAdmin(pinInput);
    if (success) {
      setPinError(false);
      setPinInput('');
      showToast('Portal unlocked successfully', 'success');
    } else {
      setPinError(true);
      showToast('Invalid access PIN key!', 'error');
    }
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    if (val.trim()) {
      const parsed = parseVideoUrl(val);
      const autoThumb = getAutoThumbnail(parsed, category);
      setThumbnail(autoThumb);
      if (!title.trim()) {
        setTitle(`Hot Video HD #${Math.floor(Math.random() * 900) + 100}`);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Resized = await resizeImageFile(file, 800, 450, 0.85);
      setThumbnail(base64Resized);
      showToast('Custom thumbnail uploaded successfully!', 'success');
    } catch {
      showToast('Failed to process uploaded image file.', 'error');
    }
  };

  const handleFetchThumbnail = () => {
    if (!urlInput.trim()) {
      showToast('Please paste a video URL or embed code first.', 'error');
      return;
    }
    const parsed = parseVideoUrl(urlInput);
    const autoThumb = getAutoThumbnail(parsed, category);
    setThumbnail(autoThumb);
    showToast('Thumbnail auto-extracted from link!', 'success');
  };

  // Batch slot helper functions
  const updateBatchSlot = (index: number, field: keyof BatchVideoDraft, value: any) => {
    setBatchSlots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleBatchSlotUrlChange = (index: number, val: string) => {
    setBatchSlots((prev) => {
      const updated = [...prev];
      const slot = { ...updated[index], url: val };
      if (val.trim()) {
        const parsed = parseVideoUrl(val);
        slot.thumbnail = getAutoThumbnail(parsed, 'HD Videos');
        if (!slot.title.trim()) {
          slot.title = `Exclusive Video #${index + 1}`;
        }
      }
      updated[index] = slot;
      return updated;
    });
  };

  const handleBatchSlotFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Resized = await resizeImageFile(file, 800, 450, 0.85);
      updateBatchSlot(index, 'thumbnail', base64Resized);
      showToast(`Slot #${index + 1} thumbnail uploaded!`, 'success');
    } catch {
      showToast('Failed to process image file.', 'error');
    }
  };

  const rerollAllBatchStats = () => {
    setBatchSlots((prev) =>
      prev.map((slot) => {
        const stats = generateRandomStats();
        return {
          ...slot,
          views: stats.views,
          likes: stats.likes,
          likePercentage: stats.likePercentage,
        };
      })
    );
    showToast('All batch slots randomized (200k - 10M views, 90-99% likes)!', 'success');
  };

  const handleQuickPasteProcess = () => {
    if (!quickPasteText.trim()) {
      showToast('Please paste video links or lines in the text box', 'error');
      return;
    }

    const lines = quickPasteText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 10);

    if (lines.length === 0) {
      showToast('No valid lines found', 'error');
      return;
    }

    setBatchSlots((prev) => {
      const updated = [...prev];
      lines.forEach((line, idx) => {
        if (idx < updated.length) {
          const parsed = parseVideoUrl(line);
          const autoThumb = getAutoThumbnail(parsed, 'HD Videos');
          const stats = generateRandomStats();
          updated[idx] = {
            ...updated[idx],
            url: line,
            title: updated[idx].title.trim() || `Hot HD Video #${idx + 1}`,
            thumbnail: autoThumb,
            views: stats.views,
            likes: stats.likes,
            likePercentage: stats.likePercentage,
          };
        }
      });
      return updated;
    });

    setShowQuickPaste(false);
    setQuickPasteText('');
    showToast(`Loaded ${lines.length} videos into batch slots!`, 'success');
  };

  // Submit Single Video
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      showToast('Please provide a video URL or Embed code.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsed = parseVideoUrl(urlInput);
      const finalThumbnail = thumbnail.trim() || getAutoThumbnail(parsed, category);
      const finalTitle = title.trim() || 'HD Stream';

      const stats = generateRandomStats();
      const finalViews = singleViews >= 200_000 ? singleViews : stats.views;
      const finalLikePct = singleLikePercentage > 0 ? singleLikePercentage : stats.likePercentage;
      const finalLikes = singleLikes > 0 ? singleLikes : Math.round(finalViews * (finalLikePct / 100));

      if (editingVideo) {
        await onUpdateVideo(editingVideo.id, {
          title: finalTitle,
          url: urlInput.trim(),
          embedUrl: parsed.embedUrl,
          videoType: parsed.videoType,
          provider: parsed.provider,
          category: 'HD Videos',
          duration: duration.trim(),
          thumbnail: finalThumbnail,
          isFeatured,
          views: finalViews,
          likes: finalLikes,
          likePercentage: finalLikePct,
        });
        showToast('Video updated successfully!', 'success');
      } else {
        await onPublishVideo({
          title: finalTitle,
          url: urlInput.trim(),
          embedUrl: parsed.embedUrl,
          videoType: parsed.videoType,
          provider: parsed.provider,
          category: 'HD Videos',
          duration: duration.trim(),
          thumbnail: finalThumbnail,
          isFeatured,
          views: finalViews,
          likes: finalLikes,
          likePercentage: finalLikePct,
        });
        showToast('Video published live!', 'success');
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Operation failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Batch of up to 10 Videos
  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filledSlots = batchSlots.filter((slot) => slot.url.trim().length > 0);

    if (filledSlots.length === 0) {
      showToast('Please fill in at least one video slot with a URL or embed code.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedVideos = filledSlots.map((slot, index) => {
        const parsed = parseVideoUrl(slot.url.trim());
        const finalThumbnail = slot.thumbnail.trim() || getAutoThumbnail(parsed, 'HD Videos');
        const finalTitle = slot.title.trim() || `Hot Video #${index + 1}`;
        const stats = generateRandomStats();

        const views = slot.views >= 200_000 ? slot.views : stats.views;
        const likePct = slot.likePercentage > 0 ? slot.likePercentage : stats.likePercentage;
        const likes = slot.likes > 0 ? slot.likes : Math.round(views * (likePct / 100));

        return {
          title: finalTitle,
          url: slot.url.trim(),
          embedUrl: parsed.embedUrl,
          videoType: parsed.videoType,
          provider: parsed.provider,
          category: 'HD Videos',
          duration: slot.duration.trim() || '15:20',
          thumbnail: finalThumbnail,
          isFeatured: slot.isFeatured,
          views,
          likes,
          likePercentage: likePct,
        };
      });

      if (onBatchPublishVideos) {
        await onBatchPublishVideos(formattedVideos);
      } else {
        for (const v of formattedVideos) {
          await onPublishVideo(v);
        }
      }

      showToast(`Batch added: ${formattedVideos.length} videos live in catalog!`, 'success');
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Batch publishing failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Admin Content Manager</span>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-200">
                    Unlocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold border border-orange-200">
                    PIN Protected
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Publish, edit, auto-parse streaming links, or manage the catalog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={onLockAdmin}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unauthenticated PIN View */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 border border-orange-200 flex items-center justify-center mb-4 shadow-sm">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Admin Authentication</h4>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Enter your master administrative PIN code to access video management controls. Default PIN is <strong className="text-orange-600 font-mono">8888</strong>.
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN (8888)"
                  className={`w-full h-12 text-center text-xl tracking-widest font-mono rounded-xl bg-slate-50 border ${
                    pinError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200'
                  } focus:border-orange-500 focus:bg-white focus:outline-none transition-all`}
                  maxLength={8}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Dashboard</span>
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Management Controls */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Tabs Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'single'
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{editingVideo ? 'Edit Video' : 'Single Video'}</span>
                </button>

                {!editingVideo && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('batch')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'batch'
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Batch Upload (10 Videos)</span>
                  </button>
                )}
              </div>

              {onDeleteAllVideos && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear ALL videos from Firestore?')) {
                      onDeleteAllVideos();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* TAB 1: SINGLE VIDEO FORM */}
            {activeTab === 'single' ? (
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                {/* URL Input with Auto Parser */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Video Stream URL or Iframe Embed Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="Paste MP4, m3u8, YouTube, XVideos, Pornhub, Spankbang, or <iframe>..."
                      className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleFetchThumbnail}
                      className="px-3.5 rounded-xl border border-slate-200 hover:bg-orange-50 hover:border-orange-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Auto Extract Thumbnail"
                    >
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="hidden sm:inline">Auto Parse</span>
                    </button>
                  </div>
                </div>

                {/* Video Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter engaging descriptive title..."
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                {/* Thumbnail Image URL & File Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Thumbnail Image (URL or File Upload)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 flex gap-2">
                      <input
                        type="text"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        placeholder="https://... image url or auto-parsed"
                        className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:border-orange-500 focus:bg-white focus:outline-none"
                      />
                      <label className="h-11 px-3.5 rounded-xl border border-slate-200 hover:bg-orange-50 hover:border-orange-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-orange-500" />
                        <span>Upload</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>

                    {/* Thumbnail Preview Card */}
                    <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                          onError={() => setThumbnail('')}
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-400 text-xs flex flex-col items-center">
                          <ImageIcon className="w-5 h-5 mb-1 text-slate-500" />
                          <span>No Preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Duration, Category, and Feature Switch */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 18:45"
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as VideoCategory)}
                      className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:border-orange-500 focus:bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="HD Videos">HD Videos</option>
                      <option value="Trending">Trending</option>
                      <option value="Amateur">Amateur</option>
                      <option value="Solo">Solo</option>
                      <option value="Hardcore">Hardcore</option>
                      <option value="VR & 4K">VR & 4K</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-700">Feature as Top Banner</span>
                    </label>
                  </div>
                </div>

                {/* Stats Settings (200k - 10M Views & Likes) */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      Realistic Portal Stats (Auto Generated)
                    </span>
                    <button
                      type="button"
                      onClick={rerollSingleStats}
                      className="text-xs text-orange-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-roll
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Views Count</span>
                      <input
                        type="number"
                        value={singleViews}
                        onChange={(e) => setSingleViews(parseInt(e.target.value) || 0)}
                        className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 font-mono text-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Like Ratio (%)</span>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={singleLikePercentage}
                        onChange={(e) => setSingleLikePercentage(parseInt(e.target.value) || 97)}
                        className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 font-mono text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingVideo ? 'Update Video' : 'Publish Live to Catalog'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: BATCH 10-SLOT UPLOADER */
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-orange-950 uppercase">
                      Fast Multi-Video Batch Publisher (10 Slots)
                    </h4>
                    <p className="text-[11px] text-orange-800">
                      Paste links into slots below or use Quick Multi-Paste to populate multiple slots instantly.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickPaste(!showQuickPaste)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-orange-300 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-orange-500" />
                      <span>{showQuickPaste ? 'Hide Quick Paste' : 'Quick Multi-Paste'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={rerollAllBatchStats}
                      className="px-3 py-1.5 rounded-lg bg-white border border-orange-300 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
                      <span>Randomize All Stats</span>
                    </button>
                  </div>
                </div>

                {/* Quick Paste Modal / Accordion */}
                {showQuickPaste && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Paste Up to 10 Video Links (One Per Line):
                    </label>
                    <textarea
                      rows={4}
                      value={quickPasteText}
                      onChange={(e) => setQuickPasteText(e.target.value)}
                      placeholder="https://example.com/stream1.mp4&#10;https://youtube.com/watch?v=...&#10;https://xvideos.com/video123"
                      className="w-full p-3 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleQuickPasteProcess}
                        className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Load Into Batch Slots
                      </button>
                    </div>
                  </div>
                )}

                {/* 10 Batch Slots Grid */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {batchSlots.map((slot, index) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>

                      {/* Video Link */}
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={slot.url}
                          onChange={(e) => handleBatchSlotUrlChange(index, e.target.value)}
                          placeholder="Paste video stream link or embed code..."
                          className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* Video Title */}
                      <div className="w-full sm:w-44">
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) => updateBatchSlot(index, 'title', e.target.value)}
                          placeholder="Video title..."
                          className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* Duration */}
                      <div className="w-full sm:w-24">
                        <input
                          type="text"
                          value={slot.duration}
                          onChange={(e) => updateBatchSlot(index, 'duration', e.target.value)}
                          placeholder="15:20"
                          className="w-full h-9 px-2 text-center rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* Thumbnail Upload & Preview */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="h-9 px-2 rounded-lg border border-slate-200 bg-white hover:bg-orange-50 text-slate-600 text-xs flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px]">Thumb</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleBatchSlotFileUpload(index, e)}
                            className="hidden"
                          />
                        </label>

                        {slot.thumbnail && (
                          <div className="w-9 h-9 rounded bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
                            <img
                              src={slot.thumbnail}
                              alt="Thumb"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Batch Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    {batchSlots.filter((s) => s.url.trim().length > 0).length} of 10 slots filled
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Publishing Batch...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Publish All Filled Slots</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
