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
  onDelete?: (id: string) => void;
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
    <article
      id={`video-card-${video.id}`}
      className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-orange-400 transition-all duration-200 hover:shadow-lg flex flex-col"
      itemScope
      itemType="https://schema.org/VideoObject"
    >
      <meta itemProp="name" content={video.title || 'HD Adult Video'} />
      <meta itemProp="description" content={`Watch ${video.title || 'HD video'} on HOT HAVEN.`} />
      <meta itemProp="thumbnailUrl" content={video.thumbnail} />
      <meta itemProp="uploadDate" content={new Date(video.createdAt || Date.now()).toISOString()} />
      {video.duration && <meta itemProp="duration" content={video.duration} />}

      {/* Thumbnail Container */}
      <div
        className="relative aspect-video w-full bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
        onClick={() => onSelect(video)}
      >
        <img
          src={video.thumbnail}
          alt={video.title || 'Video Thumbnail'}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback placeholder with clean orange badge
            const target = e.target as HTMLElement;
            target.style.display = 'none';
          }}
        />

        {/* Subtle Bottom Gradient for Duration Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity"></div>

        {/* Clean Play Icon Center Hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
            <Play className="w-5 h-5 fill-orange-600 ml-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {video.isFeatured && (
              <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-white" /> HOT
              </span>
            )}
            {video.provider && (
              <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-slate-200 text-[10px] font-medium uppercase font-mono">
                {video.provider}
              </span>
            )}
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold font-mono">
            {video.duration}
          </div>
        )}
      </div>

      {/* Card Body - Video Title */}
      <div
        className="px-3.5 pt-3 pb-1 bg-white cursor-pointer"
        onClick={() => onSelect(video)}
      >
        <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
          {video.title || 'HD Video Stream'}
        </h3>
      </div>

      {/* Card Info Details (Views & Likes in Percentage) */}
      <div className="p-3.5 pt-1.5 flex items-center justify-between text-xs text-slate-500 bg-white mt-auto">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
            <Eye className="w-3.5 h-3.5 text-orange-500" />
            <span>{formatViews(video.views)}</span>
          </span>

          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 font-bold text-[11px] font-mono border border-orange-100">
            <Heart className="w-3 h-3 fill-orange-500 text-orange-500" />
            <span>{likePct}%</span>
          </span>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-1">
          <button
            id={`bookmark-btn-${video.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(video);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Save to Bookmarks'}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          <button
            id={`share-btn-${video.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onShare(video);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Share Video"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {isAdmin && (
            <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-slate-200">
              <button
                id={`edit-btn-${video.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit(video);
                }}
                className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                title="Edit Video"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                id={`delete-btn-${video.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete && confirm('Delete this video?')) onDelete(video.id);
                }}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Video"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
