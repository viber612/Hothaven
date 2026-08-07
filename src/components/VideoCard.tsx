import React from 'react';
import {
  Play,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Edit2,
  Trash2,
  Sparkles,
  Flame,
} from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatViews, getLikePercentage } from '../utils/formatters';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  isBookmarked: boolean;
  onToggleBookmark: (video: VideoItem) => void;
  onShare: (video: VideoItem) => void;
  isAdmin: boolean;
  onEdit?: (video: VideoItem) => void;
  onDelete?: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  isBookmarked,
  onToggleBookmark,
  onShare,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const likePct = getLikePercentage(video);

  return (
    <div className="group relative bg-[#16161e] border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-950/30 flex flex-col">
      {/* Thumbnail Container */}
      <div
        className="relative w-full min-h-[220px] bg-[#0c0c14] overflow-hidden cursor-pointer flex items-center justify-center p-1"
        onClick={() => onSelect(video)}
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || "Video Thumbnail"}
            className="max-w-full max-h-[380px] object-contain rounded-lg transform group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-100"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#12121c] flex flex-col items-center justify-center text-slate-500 p-4 text-center">
            <Play className="w-8 h-8 mb-1 text-red-500/80" />
            <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">Ultra HD Stream</span>
          </div>
        )}

        {/* Hover Overlay Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity"></div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg group-hover:bg-gradient-to-tr group-hover:from-red-600 group-hover:to-orange-500 group-hover:border-transparent group-hover:scale-110 group-hover:shadow-red-600/50 transition-all duration-300">
            <Play className="w-5 h-5 text-white fill-white ml-0.5 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {video.isFeatured && (
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-bold uppercase flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-amber-200" /> HOT
              </span>
            )}
          </div>

          {video.duration ? (
            <span className="px-2 py-0.5 rounded-md bg-black/80 text-amber-400 border border-white/10 font-mono text-[11px] font-bold">
              {video.duration}
            </span>
          ) : null}
        </div>

        {/* Admin Quick Action Overlay */}
        {isAdmin && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-30">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(video);
              }}
              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Edit Video"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(video);
              }}
              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Delete Video"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Card Body - Video Title */}
      <div
        className="px-3.5 pt-3 pb-1 bg-[#16161e] cursor-pointer"
        onClick={() => onSelect(video)}
      >
        <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
          {video.title || 'HD Video Stream'}
        </h3>
      </div>

      {/* Card Info Details (Views & Likes in Percentage) */}
      <div className="p-3.5 pt-1.5 flex items-center justify-between text-xs text-slate-400 bg-[#16161e]">
        <div className="flex items-center gap-3 font-medium">
          <span className="flex items-center gap-1 text-slate-300 font-mono text-[11px]">
            <Eye className="w-3.5 h-3.5 text-red-400" />
            <span>{formatViews(video.views)}</span>
          </span>

          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-amber-300 font-bold text-[11px] font-mono">
            <Heart className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{likePct}% liked</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleBookmark(video)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-300'
                : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Video'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Admin Bottom Bar */}
      {isAdmin && (
        <div className="px-3 py-2 bg-red-950/40 border-t border-red-500/30 flex items-center justify-between text-xs">
          <span className="text-amber-400 font-mono text-[10px] font-bold">ADMIN PANEL</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(video);
              }}
              className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-colors cursor-pointer"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(video);
              }}
              className="px-2 py-0.5 rounded bg-red-600/30 hover:bg-red-600/60 text-red-300 border border-red-500/50 text-[11px] font-bold transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

