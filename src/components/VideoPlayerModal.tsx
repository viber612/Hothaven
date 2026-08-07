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
} from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatViews, formatLikes, getLikePercentage } from '../utils/formatters';

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
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset state when video changes
    setForceEmbedMode(false);
    setIsPlaying(true);
    setProgress(0);
  }, [video]);

  if (!video) return null;

  // Recommendations filtering (other videos except current)
  const recommendations = allVideos.filter((v) => v.id !== video.id).slice(0, 4);

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
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#12121a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Header Bar */}
        <div className="p-3 sm:p-4 bg-[#181824] border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-1 rounded bg-red-600/30 border border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wider">
              STREAM PLAYER
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Force Embed Toggle Switch */}
            <button
              onClick={() => setForceEmbedMode(!forceEmbedMode)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                forceEmbedMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Toggle Force Embed Mode if video source is blocked by browser policies"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Direct Player / Embed Toggle</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player & Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-y-auto">
          {/* Main Stage (2 cols on lg) */}
          <div className="lg:col-span-2 bg-black flex flex-col justify-center">
            <div ref={containerRef} className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
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

                  {/* HTML5 Custom Controls Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Progress Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleSeek}
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />

                    <div className="flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="hover:text-red-400 cursor-pointer">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button onClick={toggleMute} className="hover:text-red-400 cursor-pointer">
                            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-16 h-1 bg-white/30 rounded appearance-none cursor-pointer accent-red-500"
                          />
                        </div>

                        <span className="font-mono text-[11px] text-slate-300">
                          {currentTimeStr} / {durationStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={toggleFullscreen} className="hover:text-red-400 cursor-pointer">
                          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
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

            {/* Video Controls & Information */}
            <div className="p-4 bg-[#14141e] border-t border-white/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Eye className="w-3.5 h-3.5 text-red-400" /> {formatViews(video.views)} views
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 font-mono text-xs">
                      <Heart className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {getLikePercentage(video)}% Positive Rating
                    </span>
                    <span className="text-slate-500 font-mono">
                      Source: {video.provider || 'HD Stream'}
                    </span>
                  </div>
                </div>

                {/* Player Action Buttons */}
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-white/10">
                      <button
                        type="button"
                        onClick={() => onEditVideo?.(video)}
                        className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Edit Video"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteVideo?.(video.id);
                          onClose();
                        }}
                        className="px-3 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onLike(video)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isLiked
                        ? 'bg-red-600/30 border-red-500 text-red-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{video.likes + (isLiked ? 1 : 0)}</span>
                  </button>

                  <button
                    onClick={() => onToggleBookmark(video)}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Sidebar (1 col) */}
          <div className="p-4 bg-[#101018] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              More Recommended Videos
            </h4>

            {recommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectVideo(rec)}
                className="group flex gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/30 transition-all cursor-pointer"
              >
                <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 flex items-center justify-center">
                  {rec.thumbnail ? (
                    <>
                      <img
                        src={rec.thumbnail}
                        alt={rec.title || "Thumbnail"}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                        <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-red-600 group-hover:border-transparent group-hover:scale-110 transition-all">
                          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#161622] flex items-center justify-center text-slate-500">
                      <Play className="w-4 h-4 text-red-500 fill-red-500" />
                    </div>
                  )}
                  {rec.duration ? (
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-amber-400 font-mono text-[9px] font-bold z-10">
                      {rec.duration}
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-center">
                  <h5 className="text-xs font-bold text-white group-hover:text-amber-400 line-clamp-1 mb-1">
                    {rec.title || 'HD Video Stream'}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300 font-mono">
                      <Eye className="w-3 h-3 text-red-400" />
                      {formatViews(rec.views)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                      <Heart className="w-3 h-3 fill-amber-400" />
                      {getLikePercentage(rec)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
