import React from 'react';
import { Play, Flame, Eye, Heart, Share2, Bookmark, Sparkles } from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatViews, getLikePercentage } from '../utils/formatters';

interface HeroFeaturedProps {
  video: VideoItem;
  onSelectVideo: (video: VideoItem) => void;
  onToggleBookmark: (video: VideoItem) => void;
  isBookmarked: boolean;
  onShare: (video: VideoItem) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  video,
  onSelectVideo,
  onToggleBookmark,
  isBookmarked,
  onShare,
}) => {
  const likePct = getLikePercentage(video);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
      <div className="relative w-full min-h-[360px] sm:min-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden border border-red-500/30 shadow-2xl shadow-red-950/40 group">
        {/* Backdrop Image */}
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || "Featured thumbnail"}
            className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-75"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-red-950/80 via-[#12121a] to-black"></div>
        )}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d11] via-[#0d0d11]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d11] via-[#0d0d11]/80 to-transparent"></div>

        {/* Content Box */}
        <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 max-w-3xl text-white">
          {/* Featured Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-widest shadow-md shadow-red-600/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              HOT FEATURED
            </span>
            {video.duration ? (
              <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-amber-400 text-xs font-bold font-mono">
                {video.duration}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 font-display drop-shadow-md line-clamp-2">
            {video.title || 'HD Premium Stream'}
          </h2>

          {/* Stats Bar */}
          <div className="flex items-center flex-wrap gap-4 text-xs sm:text-sm text-slate-300 mb-6 font-medium">
            <span className="flex items-center gap-1.5 font-mono text-slate-200">
              <Eye className="w-4 h-4 text-red-400" />
              <span>{formatViews(video.views)} views</span>
            </span>

            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 font-mono">
              <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{likePct}% liked</span>
            </span>

            <span className="flex items-center gap-1.5 text-slate-400">
              <Flame className="w-4 h-4 text-orange-400" />
              {video.provider || 'HD Stream'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectVideo(video)}
              className="py-3.5 px-7 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-400 shadow-xl shadow-red-600/40 hover:shadow-red-500/60 transition-all duration-200 flex items-center gap-2.5 cursor-pointer transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Watch Stream Now</span>
            </button>

            <button
              onClick={() => onToggleBookmark(video)}
              className={`p-3.5 rounded-xl border backdrop-blur-md transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Video'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

