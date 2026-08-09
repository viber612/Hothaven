import React from 'react';
import { Play, Flame, Eye, Heart, Share2, Bookmark, Sparkles } from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatViews, getLikePercentage } from '../utils/formatters';

interface HeroFeaturedProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  onToggleBookmark: (video: VideoItem) => void;
  isBookmarked: boolean;
  onShare: (video: VideoItem) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  video,
  onPlay,
  onToggleBookmark,
  isBookmarked,
  onShare,
}) => {
  const likePct = getLikePercentage(video);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
      <div className="relative w-full min-h-[360px] sm:min-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden border border-orange-200 bg-white shadow-xl shadow-orange-500/5 group">
        {/* Background Image Container */}
        <div className="absolute inset-0 bg-slate-950 overflow-hidden flex items-center justify-center">
          <img
            src={video.thumbnail}
            alt={video.title || 'Featured HD Video'}
            className="w-full h-full object-contain opacity-90 group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Clean Contrast Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>

        {/* Content Box */}
        <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 max-w-3xl text-white">
          {/* Featured Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Featured Stream
            </span>
            {video.duration ? (
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-mono font-bold">
                {video.duration}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 font-display leading-tight line-clamp-2">
            {video.title || 'HD Premium Stream'}
          </h2>

          {/* Stats Bar */}
          <div className="flex items-center flex-wrap gap-4 text-xs sm:text-sm text-slate-200 mb-6 font-medium">
            <span className="flex items-center gap-1.5 font-mono">
              <Eye className="w-4 h-4 text-orange-400" />
              <span>{formatViews(video.views)} views</span>
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30 font-mono">
              <Heart className="w-4 h-4 fill-orange-400 text-orange-400" />
              <span>{likePct}% liked</span>
            </span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <Flame className="w-4 h-4 text-orange-400" />
              {video.provider || 'HD Stream'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-3">
            <button
              id="hero-watch-button"
              onClick={() => onPlay(video)}
              className="px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>Watch Video</span>
            </button>

            <button
              id="hero-bookmark-button"
              onClick={() => onToggleBookmark(video)}
              className={`p-3 rounded-full border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
              }`}
              title={isBookmarked ? 'Saved' : 'Save to Bookmarks'}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            <button
              id="hero-share-button"
              onClick={() => onShare(video)}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all cursor-pointer"
              title="Share Stream"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
