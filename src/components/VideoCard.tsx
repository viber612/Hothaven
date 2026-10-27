import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatViews, getLikePercentage } from '../utils/formatters';

interface VideoCardProps {
  video: VideoItem;
  onSelect: (video: VideoItem) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (video: VideoItem) => void;
  onShare?: (video: VideoItem) => void;
  isAdmin: boolean;
  onEdit?: (video: VideoItem) => void;
  onDelete?: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelect,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const likePct = getLikePercentage(video);

  return (
    <article
      id={`video-card-${video.id}`}
      className="group relative bg-white border border-black flex flex-col rounded-none"
      itemScope
      itemType="https://schema.org/VideoObject"
    >
      <meta itemProp="name" content={video.title || 'HD Adult Video'} />
      <meta itemProp="description" content={`Watch ${video.title || 'HD video'} on HOTHAVEN.`} />
      <meta itemProp="thumbnailUrl" content={video.thumbnail} />
      <meta itemProp="uploadDate" content={new Date(video.createdAt || Date.now()).toISOString()} />
      {video.duration && <meta itemProp="duration" content={video.duration} />}

      {/* Thumbnail Container (Sharp Square Corners) */}
      <div
        className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer flex items-center justify-center rounded-none"
        onClick={() => onSelect(video)}
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || 'Video Thumbnail'}
            className="w-full h-full object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLElement;
              target.style.display = 'none';
            }}
          />
        ) : null}

      </div>

      {/* Card Body - Video Title */}
      <div
        className="px-3 pt-3 pb-1.5 bg-white cursor-pointer"
        onClick={() => onSelect(video)}
      >
        <h3 className="text-sm font-bold text-black group-hover:underline line-clamp-2 leading-snug">
          {video.title || 'HD Video Stream'}
        </h3>
      </div>

      {/* Card Footer - Unboxed Metadata & Admin Controls */}
      <div className="px-3 pb-3 pt-1 flex items-center justify-between text-xs text-black/70 bg-white mt-auto font-mono tabular-nums">
        <div className="flex items-center gap-1.5">
          <span>{formatViews(video.views)} views</span>
          <span aria-hidden="true">·</span>
          <span className="font-bold text-black">{likePct}%</span>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1.5">
            <button
              id={`edit-btn-${video.id}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.(video);
              }}
              className="px-2 py-1 border border-black bg-white text-black hover:bg-black hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Edit Video"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              id={`delete-btn-${video.id}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(video.id);
              }}
              className="px-2 py-1 border border-black bg-black text-white hover:bg-white hover:text-black text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Delete Video"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
