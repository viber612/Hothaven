import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react';
import { VideoItem, VideoCategory, SortOption, ToastMessage } from './types/video';
import {
  subscribeToVideos,
  addVideoToFirestore,
  batchAddVideosToFirestore,
  updateVideoInFirestore,
  deleteVideoFromFirestore,
  deleteAllVideosFromFirestore,
  incrementVideoViews,
  toggleVideoLike,
} from './services/videoService';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { VideoCard } from './components/VideoCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AgeGateModal } from './components/AgeGateModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';

const ITEMS_PER_PAGE = 12;
const DEFAULT_ADMIN_PIN = '8888';

const CATEGORIES: VideoCategory[] = [
  'All',
  'HD Videos',
  'Trending',
  'Amateur',
  'Solo',
  'Hardcore',
  'VR & 4K',
];

export default function App() {
  // 1. Age Gate State
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hothaven_age_verified') === 'true';
    } catch {
      return false;
    }
  });
  const [showAgeGateModal, setShowAgeGateModal] = useState<boolean>(!isAgeVerified);

  // 2. Real-time Firestore Videos
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true);

  // 3. Search & Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 4. Modals and Drawers State
  const [activePlayerVideo, setActivePlayerVideo] = useState<VideoItem | null>(null);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState<boolean>(false);

  // 5. Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hothaven_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // 6. Bookmarks State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hothaven_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 7. Liked Videos Local Tracking
  const [likedIds, setLikedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hothaven_liked_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 8. Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subscribe to real-time Firestore synchronization
  useEffect(() => {
    const unsubscribe = subscribeToVideos((fetchedVideos) => {
      setVideos(fetchedVideos);
      setIsLoadingVideos(false);
    });
    return () => unsubscribe();
  }, []);

  // Save Bookmarks to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem('hothaven_bookmarks', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.warn('Unable to persist bookmarks:', e);
    }
  }, [bookmarkedIds]);

  // Save Liked IDs to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem('hothaven_liked_videos', JSON.stringify(likedIds));
    } catch (e) {
      console.warn('Unable to persist liked videos:', e);
    }
  }, [likedIds]);

  // Prevent background body scrolling when any overlay/modal/drawer is open
  useEffect(() => {
    const isAnyModalOpen =
      showAgeGateModal ||
      activePlayerVideo !== null ||
      showAdminModal ||
      showBookmarksDrawer;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showAgeGateModal, activePlayerVideo, showAdminModal, showBookmarksDrawer]);

  // Handle Age Verification
  const handleConfirmAge = () => {
    try {
      localStorage.setItem('hothaven_age_verified', 'true');
    } catch (e) {
      console.warn('Unable to persist age verification:', e);
    }
    setIsAgeVerified(true);
    setShowAgeGateModal(false);
    showToast('Age verified! Welcome to HOT HAVEN.', 'success');
  };

  // Handle Admin PIN Authentication
  const handleAuthenticateAdmin = (pin: string) => {
    if (pin.trim() === DEFAULT_ADMIN_PIN) {
      try {
        sessionStorage.setItem('hothaven_admin_auth', 'true');
      } catch (e) {
        console.warn('Unable to persist admin session:', e);
      }
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleLockAdmin = () => {
    try {
      sessionStorage.removeItem('hothaven_admin_auth');
    } catch (e) {
      console.warn('Unable to clear admin session:', e);
    }
    setIsAdmin(false);
    showToast('Admin Session Locked', 'info');
  };

  // Filtered and Sorted Videos Computation
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (v) => v.category && v.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search Query Filter (URL, title or provider)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (v) =>
          (v.title && v.title.toLowerCase().includes(q)) ||
          (v.url && v.url.toLowerCase().includes(q)) ||
          (v.provider && v.provider.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'views') {
      result.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'likes') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } else {
      // Default: Latest
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [videos, searchQuery, selectedCategory, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE) || 1;
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVideos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVideos, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Featured Hero Video selection
  const featuredVideo = useMemo(() => {
    return videos.find((v) => v.isFeatured) || videos[0] || null;
  }, [videos]);

  // Bookmarked video items
  const bookmarkedVideos = useMemo(() => {
    return videos.filter((v) => bookmarkedIds.includes(v.id));
  }, [videos, bookmarkedIds]);

  // Video Actions
  const handleSelectVideo = (video: VideoItem) => {
    setActivePlayerVideo(video);
    incrementVideoViews(video.id, video.views);
  };

  const handleToggleBookmark = (video: VideoItem) => {
    if (bookmarkedIds.includes(video.id)) {
      setBookmarkedIds((prev) => prev.filter((id) => id !== video.id));
      showToast(`Removed "${video.title.slice(0, 20)}..." from saved bookmarks`, 'info');
    } else {
      setBookmarkedIds((prev) => [...prev, video.id]);
      showToast(`Saved "${video.title.slice(0, 20)}..." to bookmarks`, 'success');
    }
  };

  const handleToggleLike = async (video: VideoItem) => {
    const isLiked = likedIds.includes(video.id);
    if (isLiked) {
      setLikedIds((prev) => prev.filter((id) => id !== video.id));
      await toggleVideoLike(video.id, video.likes, false);
      showToast('Unliked video', 'info');
    } else {
      setLikedIds((prev) => [...prev, video.id]);
      await toggleVideoLike(video.id, video.likes, true);
      showToast('Liked video!', 'success');
    }
  };

  const handleShareVideo = (video: VideoItem) => {
    const shareUrl = `${window.location.origin}?v=${video.id}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => showToast('Video link copied to clipboard!', 'success'),
      () => showToast('Failed to copy link', 'error')
    );
  };

  // Admin Video CRUD Actions
  const handlePublishVideo = async (
    videoData: Omit<VideoItem, 'id' | 'views' | 'likes' | 'createdAt'> & {
      views?: number;
      likes?: number;
      likePercentage?: number;
    }
  ) => {
    if (!isAdmin) {
      showToast('Admin access required to publish videos', 'error');
      return;
    }
    await addVideoToFirestore(videoData);
  };

  const handleBatchPublishVideos = async (
    videosData: Array<
      Omit<VideoItem, 'id' | 'views' | 'likes' | 'createdAt'> & {
        views?: number;
        likes?: number;
        likePercentage?: number;
      }
    >
  ) => {
    if (!isAdmin) {
      showToast('Admin access required to publish videos', 'error');
      return;
    }
    await batchAddVideosToFirestore(videosData);
  };

  const handleUpdateVideo = async (id: string, updates: Partial<VideoItem>) => {
    if (!isAdmin) {
      showToast('Admin access required to edit videos', 'error');
      return;
    }
    await updateVideoInFirestore(id, updates);
    setEditingVideo(null);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!isAdmin) {
      showToast('Admin access required to delete videos', 'error');
      return;
    }
    try {
      await deleteVideoFromFirestore(id);
      showToast('Video removed from catalog.', 'success');
      if (activePlayerVideo?.id === id) {
        setActivePlayerVideo(null);
      }
      if (editingVideo?.id === id) {
        setEditingVideo(null);
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
      showToast('Error deleting video.', 'error');
    }
  };

  const handleDeleteAllVideos = async () => {
    if (!isAdmin) {
      showToast('Admin access required to clear videos', 'error');
      return;
    }
    await deleteAllVideosFromFirestore();
    showToast('All videos wiped from catalog.', 'success');
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Age Verification Modal */}
      <AgeGateModal isOpen={showAgeGateModal} onConfirm={handleConfirmAge} />

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        bookmarkCount={bookmarkedIds.length}
        onOpenBookmarks={() => setShowBookmarksDrawer(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        isAdmin={isAdmin}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Featured Banner (Shown when no search active) */}
        {!searchQuery && featuredVideo && (
          <HeroFeatured
            video={featuredVideo}
            onPlay={handleSelectVideo}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={bookmarkedIds.includes(featuredVideo.id)}
            onShare={handleShareVideo}
          />
        )}

        {/* Video Catalog Section */}
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          itemScope
          itemType="https://schema.org/CollectionPage"
        >
          {/* Category Pill Filters Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Controls Bar: Section Title & Results Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display flex items-center gap-2.5">
                <Flame className="w-6 h-6 text-orange-500" />
                <span>
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : selectedCategory !== 'All'
                    ? `${selectedCategory.toUpperCase()} VIDEOS`
                    : 'ALL HD ADULT VIDEOS'}
                </span>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  {filteredVideos.length} Streams
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Fast responsive playback in Ultra HD & 4K quality with full metadata.
              </p>
            </div>

            {/* Total Streams count */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Total catalog:</span>
              <span className="font-mono font-bold text-slate-900">{videos.length} videos</span>
            </div>
          </div>

          {/* Catalog Grid */}
          {isLoadingVideos ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-10 h-10 animate-spin text-orange-500 mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading HD video streams...</p>
            </div>
          ) : paginatedVideos.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Videos Found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
                {videos.length === 0
                  ? 'No videos in catalog yet. Click the "Manage" button in the top right to authenticate (PIN: 8888) and add videos.'
                  : 'No video items match your search query or selected category.'}
              </p>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer transition-all"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onSelect={handleSelectVideo}
                  isBookmarked={bookmarkedIds.includes(video.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onShare={handleShareVideo}
                  isAdmin={isAdmin}
                  onEdit={(v) => {
                    setEditingVideo(v);
                    setShowAdminModal(true);
                  }}
                  onDelete={(id) => handleDeleteVideo(id)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 font-mono shadow-xs">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={activePlayerVideo}
        onClose={() => setActivePlayerVideo(null)}
        onLike={handleToggleLike}
        isLiked={activePlayerVideo ? likedIds.includes(activePlayerVideo.id) : false}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={activePlayerVideo ? bookmarkedIds.includes(activePlayerVideo.id) : false}
        onShare={handleShareVideo}
        allVideos={videos}
        onSelectVideo={handleSelectVideo}
        isAdmin={isAdmin}
        onEditVideo={(v) => {
          setEditingVideo(v);
          setShowAdminModal(true);
          setActivePlayerVideo(null);
        }}
        onDeleteVideo={handleDeleteVideo}
      />

      {/* Admin Management Modal */}
      <AdminPanelModal
        isOpen={showAdminModal}
        onClose={() => {
          setShowAdminModal(false);
          setEditingVideo(null);
        }}
        isAdmin={isAdmin}
        onAuthenticateAdmin={handleAuthenticateAdmin}
        onLockAdmin={handleLockAdmin}
        onPublishVideo={handlePublishVideo}
        onBatchPublishVideos={handleBatchPublishVideos}
        editingVideo={editingVideo}
        onUpdateVideo={handleUpdateVideo}
        onDeleteVideo={handleDeleteVideo}
        onDeleteAllVideos={handleDeleteAllVideos}
        showToast={showToast}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={showBookmarksDrawer}
        onClose={() => setShowBookmarksDrawer(false)}
        bookmarks={bookmarkedVideos}
        onSelectVideo={handleSelectVideo}
        onRemoveBookmark={handleToggleBookmark}
        onClearAll={() => {
          setBookmarkedIds([]);
          showToast('Cleared all bookmarks', 'info');
        }}
      />

      {/* Toast System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <Footer
        isAdmin={isAdmin}
        onOpenAdminModal={() => setShowAdminModal(true)}
        onOpenAgeGate={() => setShowAgeGateModal(true)}
      />
    </div>
  );
}
