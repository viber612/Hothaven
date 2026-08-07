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
  Key,
  RefreshCw,
  Upload,
  Layers,
  FileVideo,
  Dice5,
  Eye,
  Heart,
  Plus,
} from 'lucide-react';
import { VideoItem, VideoCategory } from '../types/video';
import { parseVideoUrl, getAutoThumbnail } from '../utils/videoParser';
import { resizeImageFile } from '../utils/thumbnail';
import { formatViews, formatLikes, generateRandomStats } from '../utils/formatters';

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

  // Batch Form Fields (Up to 10 videos)
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
      setCategory(editingVideo.category as VideoCategory);
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
    setDuration('');
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
      showToast('Custom thumbnail uploaded! This image will be shown to all users.', 'success');
    } catch (err) {
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
    } catch (err) {
      showToast('Failed to process image file.', 'error');
    }
  };

  const rerollBatchSlotStats = (index: number) => {
    const stats = generateRandomStats();
    setBatchSlots((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        views: stats.views,
        likes: stats.likes,
        likePercentage: stats.likePercentage,
      };
      return updated;
    });
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
    showToast('All 10 video slots randomized (200k - 10M views, 90-99% likes)!', 'success');
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
        const likePercentage = slot.likePercentage > 0 ? slot.likePercentage : stats.likePercentage;
        const likes = slot.likes > 0 ? slot.likes : Math.round(views * (likePercentage / 100));

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
          likePercentage,
        };
      });

      if (onBatchPublishVideos) {
        await onBatchPublishVideos(formattedVideos);
      } else {
        for (const v of formattedVideos) {
          await onPublishVideo(v);
        }
      }

      showToast(`Successfully added ${formattedVideos.length} videos at once to catalog!`, 'success');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Batch publish error:', error);
      showToast('Batch publishing failed. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/92 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#14141e] border border-red-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 text-white my-auto max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAdmin ? (
          /* Secret PIN Lock Screen */
          <div className="py-8 text-center my-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 p-0.5 mb-4 shadow-xl shadow-amber-500/20">
              <div className="w-full h-full bg-[#14141e] rounded-[14px] flex items-center justify-center">
                <Key className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-1 font-display">PORTAL KEY ACCESS</h2>
            <p className="text-slate-400 text-xs sm:text-sm mb-6 max-w-md mx-auto">
              Enter access PIN code (default: 8888) to unlock batch adding up to 10 videos, custom titles, and catalog manager.
            </p>

            <form onSubmit={handlePinSubmit} className="max-w-xs mx-auto space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Access PIN"
                  className={`w-full px-4 py-3 rounded-xl bg-[#1c1c28] border text-center text-lg font-mono tracking-widest text-amber-300 focus:outline-none transition-all ${
                    pinError ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:border-amber-400'
                  }`}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-400 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                Authenticate Portal
              </button>
            </form>
          </div>
        ) : (
          /* Admin Form Mode */
          <div className="flex-1 flex flex-col">
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-white/10 gap-3 pr-10">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-extrabold text-white font-display">
                  {editingVideo ? 'EDIT VIDEO CATALOG ITEM' : 'ADMIN VIDEO PUBLISHER'}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {onDeleteAllVideos && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Wipe ALL videos from catalog? This cannot be undone.')) {
                        onDeleteAllVideos();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Delete all content"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}

                <button
                  onClick={onLockAdmin}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Lock Session
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs (Single vs Batch 10 Videos) */}
            {!editingVideo && (
              <div className="flex items-center gap-2 mb-5 p-1 bg-[#0e0e16] rounded-xl border border-white/10 max-w-md">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'single'
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileVideo className="w-3.5 h-3.5" />
                  <span>Single Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('batch')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'batch'
                      ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-300" />
                  <span>Add 10 Videos at Once</span>
                  <span className="px-1.5 py-0.2 bg-amber-400 text-black text-[9px] rounded-full font-black">
                    10X
                  </span>
                </button>
              </div>
            )}

            {/* ---------------- SINGLE VIDEO MODE ---------------- */}
            {activeTab === 'single' ? (
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                {/* Video Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter custom video title (e.g., HD Amateur Hot Scene #1)"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1c1c28] border border-white/10 text-white placeholder-slate-500 text-sm font-semibold focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                {/* Video URL or Embed Code */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Video URL or &lt;iframe&gt; Embed Code *
                  </label>
                  <textarea
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="Paste direct MP4 URL, YouTube, Vimeo, Pornhub, XVideos, SpankBang, or <iframe> embed snippet..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1c1c28] border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                {/* Duration & Stats Randomizer Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Duration (e.g. 18:42)
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 18:42"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1c1c28] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>

                  {/* Views & Like % Randomizer Preview */}
                  <div className="p-2.5 rounded-xl bg-[#181824] border border-white/10 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>Randomized Metrics</span>
                      <button
                        type="button"
                        onClick={rerollSingleStats}
                        className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Reroll Views and Likes"
                      >
                        <Dice5 className="w-3.5 h-3.5" />
                        <span>Reroll</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-mono text-slate-200">
                        <Eye className="w-3.5 h-3.5 text-red-400" />
                        {formatViews(singleViews || 200_000)} views (200k - 10M)
                      </span>
                      <span className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                        <Heart className="w-3.5 h-3.5 fill-amber-400" />
                        {singleLikePercentage}% rating
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Section */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Video Thumbnail</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
                      Local Upload &amp; Auto-Fetch
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold cursor-pointer shadow-md transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Upload Local Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleFetchThumbnail}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Auto-Fetch from Video Link</span>
                    </button>
                  </div>

                  {/* Thumbnail Preview */}
                  {thumbnail ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-amber-500/30 bg-black shadow-lg">
                      <img
                        src={thumbnail}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                        <span className="px-2 py-1 rounded-md bg-amber-500/90 backdrop-blur-md text-black font-bold text-[10px] flex items-center gap-1">
                          {thumbnail.startsWith('data:image/') ? (
                            <>
                              <Upload className="w-3 h-3" />
                              <span>Uploaded Local File</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>Video Link Thumbnail</span>
                            </>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setThumbnail('')}
                          className="p-1 rounded bg-black/60 hover:bg-red-600 text-white transition-colors"
                          title="Remove thumbnail"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 text-xs gap-1 bg-black/30">
                      <ImageIcon className="w-4 h-4 text-slate-600" />
                      <span>Upload local image or auto-fetch from link</span>
                    </div>
                  )}
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="featuredCheck"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1c1c28] border-white/20 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="featuredCheck" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    Feature this video in top Hero Banner
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-400 shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    <span>{editingVideo ? 'Save Changes' : 'Publish Video Live'}</span>
                  </button>

                  {editingVideo && (
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteVideo(editingVideo.id);
                        resetForm();
                        onClose();
                      }}
                      className="py-3 px-4 rounded-xl font-bold text-white bg-red-600/80 hover:bg-red-600 border border-red-500 text-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                      title="Delete this video"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="py-3 px-5 rounded-xl font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* ---------------- BATCH ADD 10 VIDEOS MODE ---------------- */
              <form onSubmit={handleBatchSubmit} className="space-y-4">
                {/* Batch Top Bar Tools */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#181824] rounded-xl border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Batch 10 Videos Slot Manager</span>
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Fill individual titles and links for up to 10 videos. All videos will receive randomized 200k-10M views and 90-99% like percentage.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={rerollAllBatchStats}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Reroll stats for all 10 slots"
                    >
                      <Dice5 className="w-3.5 h-3.5" />
                      <span>Reroll All Stats</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQuickPaste(!showQuickPaste)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Quick Multi-Paste</span>
                    </button>
                  </div>
                </div>

                {/* Quick Paste Modal/Accordion */}
                {showQuickPaste && (
                  <div className="p-3.5 rounded-xl bg-[#1c1c28] border border-amber-500/40 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Quick Paste Up to 10 Video URLs (One per line)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowQuickPaste(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      value={quickPasteText}
                      onChange={(e) => setQuickPasteText(e.target.value)}
                      placeholder="https://example.com/video1.mp4&#10;https://www.youtube.com/watch?v=...&#10;https://www.pornhub.com/view_video.php?viewkey=...&#10;<iframe>...</iframe>"
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleQuickPasteProcess}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        Auto-Populate 10 Slots
                      </button>
                    </div>
                  </div>
                )}

                {/* 10 Video Slot Items */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {batchSlots.map((slot, index) => (
                    <div
                      key={slot.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        slot.url.trim()
                          ? 'bg-[#181826] border-red-500/30'
                          : 'bg-[#14141e] border-white/10 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Slot Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-600/30 border border-red-500/40 text-red-400 font-mono font-bold text-xs">
                            Slot #{index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            {slot.title || `Video Item ${index + 1}`}
                          </span>
                        </div>

                        {/* Randomized Stats Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-slate-300 border border-white/5 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-red-400" />
                            {formatViews(slot.views)}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-amber-400" />
                            {slot.likePercentage}% likes
                          </span>
                          <button
                            type="button"
                            onClick={() => rerollBatchSlotStats(index)}
                            className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Reroll this slot's views and likes"
                          >
                            <Dice5 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Inputs Grid for each slot */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        {/* Custom Title Input */}
                        <div className="md:col-span-4">
                          <input
                            type="text"
                            value={slot.title}
                            onChange={(e) => updateBatchSlot(index, 'title', e.target.value)}
                            placeholder={`Title for Video #${index + 1}`}
                            className="w-full px-3 py-2 rounded-lg bg-[#0e0e16] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>

                        {/* URL or Embed Input */}
                        <div className="md:col-span-5">
                          <input
                            type="text"
                            value={slot.url}
                            onChange={(e) => handleBatchSlotUrlChange(index, e.target.value)}
                            placeholder="Video URL or Embed Code..."
                            className="w-full px-3 py-2 rounded-lg bg-[#0e0e16] border border-white/10 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>

                        {/* Duration Input */}
                        <div className="md:col-span-3 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={slot.duration}
                            onChange={(e) => updateBatchSlot(index, 'duration', e.target.value)}
                            placeholder="15:20"
                            className="w-16 px-2 py-2 rounded-lg bg-[#0e0e16] border border-white/10 text-white text-xs font-mono text-center focus:outline-none focus:border-red-500"
                          />

                          {/* Local Thumbnail Upload for slot */}
                          <label className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer transition-colors" title="Upload local image">
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleBatchSlotFileUpload(index, e)}
                              className="hidden"
                            />
                          </label>

                          {/* Clear Slot */}
                          {slot.url && (
                            <button
                              type="button"
                              onClick={() => {
                                const stats = generateRandomStats();
                                setBatchSlots((prev) => {
                                  const updated = [...prev];
                                  updated[index] = {
                                    ...createEmptyBatchSlot(index),
                                    views: stats.views,
                                    likes: stats.likes,
                                    likePercentage: stats.likePercentage,
                                  };
                                  return updated;
                                });
                              }}
                              className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                              title="Clear slot"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail Preview if present */}
                      {slot.thumbnail && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                          <img
                            src={slot.thumbnail}
                            alt=""
                            className="w-10 h-6 object-cover rounded border border-white/10"
                          />
                          <span className="truncate max-w-xs font-mono text-slate-300">
                            Thumbnail active
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Batch Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-400 shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    <span>
                      Publish All Filled Videos (
                      {batchSlots.filter((s) => s.url.trim().length > 0).length} / 10)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      onClose();
                    }}
                    className="py-3 px-5 rounded-xl font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

