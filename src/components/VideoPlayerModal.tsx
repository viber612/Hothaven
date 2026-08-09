import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Heart,
  Eye,
  Bookmark,
  Tv,
  Sparkles,
  Edit2,
  Trash2,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatViews, getLikePercentage } from '../utils/formatters';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onLike: (video: VideoItem) => void;
  isLiked: boolean;
  onToggleBookmark: (video: VideoItem) => void;
  isBookmarked: boolean;
  onShare: (video: VideoItem) => void;
  allVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  isAdmin?: boolean;
  onEditVideo?: (video: VideoItem) => void;
  onDeleteVideo?: (id: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onLike,
  isLiked,
  onToggleBookmark,
  isBookmarked,
  onShare,
  allVideos,
  onSelectVideo,
  isAdmin,
  onEditVideo,
  onDeleteVideo,
}) => {
  const [forceEmbedMode, setForceEmbedMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');
  const [durationStr, setDurationStr] = useState('00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset state when video changes
    setForceEmbedMode(false);
    setIsPlaying(true);
    setProgress(0);
  }, [video]);

  // Handle ESC key to close full screen overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  // Recommendations filtering (other videos except current)
  const recommendations = allVideos.filter((v) => v.id !== video.id).slice(0, 8);

  const isHtml5 = video.videoType === 'html5' && !forceEmbedMode;

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration || 1;
    setProgress((current / duration) * 100);

    const format = (s: number) => {
      const mins = Math.floor(s / 60);
      const secs = Math.floor(s % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    setCurrentTimeStr(format(current));
    setDurationStr(format(duration));
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    setProgress(pct);
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = (pct / 100) * videoRef.current.duration;
    }
  };

  const toggleFullscreen = () => {
    if (!stageRef.current) return;
    if (!document.fullscreenElement) {
      stageRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      id="video-player-overlay"
      className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-y-auto overflow-x-hidden animate-fade-in"
    >
      {/* Full Top Navigation Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Back & Video title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 text-xs font-bold transition-all cursor-pointer border border-slate-700"
            title="Back to Video Catalog (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Browse</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/40 text-orange-400 font-bold text-xs uppercase tracking-wider shrink-0">
              HD ULTRA STREAM
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md lg:max-w-xl">
              {video.title}
            </h2>
          </div>
        </div>

        {/* Right: Controls & Close */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Force Embed Toggle Switch */}
          <button
            onClick={() => setForceEmbedMode(!forceEmbedMode)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              forceEmbedMode
                ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Direct Video Stream / Iframe Embed"
          >
            <Tv className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden md:inline">
              {forceEmbedMode ? 'Embed Active' : 'Direct Player'}
            </span>
          </button>

          {/* Close button */}
          <button
            id="close-player-btn"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700"
            title="Close Player (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Player Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-6">
        {/* Cinematic Theatre Video Player Stage */}
        <div className="w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl shadow-black/80">
          <div
            ref={stageRef}
            className="relative w-full aspect-video max-h-[75vh] bg-black flex items-center justify-center overflow-hidden group"
          >
            {isHtml5 ? (
              <>
                <video
                  ref={videoRef}
                  src={video.embedUrl}
                  poster={video.thumbnail}
                  autoPlay
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />

                {/* HTML5 Custom Controls Bar Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Progress Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:bg-white/40 transition-all"
                  />

                  <div className="flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlay}
                        className="hover:text-orange-400 transition-colors cursor-pointer"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 fill-white" />
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="hover:text-orange-400 transition-colors cursor-pointer"
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4 text-orange-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>

                      <span className="font-mono text-xs text-slate-300">
                        {currentTimeStr} / {durationStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleFullscreen}
                        className="p-1 hover:text-orange-400 transition-colors cursor-pointer"
                        title="Toggle Fullscreen"
                      >
                        {isFullscreen ? (
                          <Minimize className="w-4 h-4" />
                        ) : (
                          <Maximize className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <iframe
                src={video.embedUrl}
                title="Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>

        {/* Video Information & Action Controls Card */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-black text-white mb-2 leading-snug">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono text-slate-300">
                <Eye className="w-4 h-4 text-orange-400" />
                <span className="font-bold">{formatViews(video.views)}</span> views
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 font-bold border border-orange-500/30 font-mono text-xs">
                <Heart className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                <span>{getLikePercentage(video)}% Positive Rating</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                Source: {video.provider || 'HD Stream'}
              </span>
              {video.duration && (
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                  Duration: {video.duration}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center flex-wrap gap-2.5 shrink-0 w-full md:w-auto justify-end">
            {isAdmin && (
              <div className="flex items-center gap-2 pr-2 mr-2 border-r border-slate-800">
                <button
                  type="button"
                  onClick={() => onEditVideo?.(video)}
                  className="px-3 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white border border-orange-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Edit Video"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this video?')) {
                      onDeleteVideo?.(video.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Delete Video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            <button
              onClick={() => onLike(video)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isLiked
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-orange-500/20 hover:border-orange-500/40 hover:text-orange-400'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-orange-400'}`}
              />
              <span>{video.likes + (isLiked ? 1 : 0)} Likes</span>
            </button>

            <button
              onClick={() => onToggleBookmark(video)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-orange-500/20 hover:border-orange-500/40 hover:text-orange-400'
              }`}
              title={isBookmarked ? 'Saved to Bookmarks' : 'Save to Bookmarks'}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-white text-white' : 'text-orange-400'}`}
              />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              onClick={() => onShare(video)}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              title="Share Stream URL"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Up Next & More Recommended HD Videos Section */}
        {recommendations.length > 0 && (
          <section className="w-full mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Up Next & Recommended Videos</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {recommendations.length} Recommended
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onSelectVideo(rec)}
                  className="group bg-slate-900 border border-slate-800 hover:border-orange-500/60 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-xl cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={rec.thumbnail}
                      alt={rec.title || 'Video Thumbnail'}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    {rec.duration && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                        {rec.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                      {rec.title || 'HD Adult Video Stream'}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-orange-400" />
                        {formatViews(rec.views)}
                      </span>
                      <span className="flex items-center gap-1 text-orange-400 font-bold">
                        <Heart className="w-3 h-3 fill-orange-400" />
                        {getLikePercentage(rec)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
