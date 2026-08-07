import React from 'react';
import { Bookmark, X, Play, Trash2, Eye, Heart } from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatViews, getLikePercentage } from '../utils/formatters';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onRemoveBookmark: (video: VideoItem) => void;
  onClearAll: () => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onSelectVideo,
  onRemoveBookmark,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#12121a] border-l border-white/10 h-full flex flex-col p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-lg font-bold font-display">SAVED FAVORITES ({bookmarks.length})</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        {bookmarks.length === 0 ? (
          <div className="flex-1 flex-col items-center justify-center text-center p-6 text-slate-500 flex">
            <Bookmark className="w-12 h-12 mb-3 text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">No Saved Videos Yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Click the bookmark icon on any video card to save it for quick watching later.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {bookmarks.map((video) => {
                const likePct = getLikePercentage(video);
                return (
                  <div
                    key={video.id}
                    className="group flex gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/30 transition-all"
                  >
                    <div
                      onClick={() => {
                        onSelectVideo(video);
                        onClose();
                      }}
                      className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer flex items-center justify-center"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title || "Thumbnail"}
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
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-amber-400 font-mono text-[9px] font-bold z-10">
                          {video.duration}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          onClick={() => {
                            onSelectVideo(video);
                            onClose();
                          }}
                          className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {video.title || 'HD Video Stream'}
                        </h4>
                        <button
                          onClick={() => onRemoveBookmark(video)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                          title="Remove Bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300 font-mono">
                          <Eye className="w-3 h-3 text-red-400" />
                          {formatViews(video.views)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                          <Heart className="w-3 h-3 fill-amber-400" />
                          {likePct}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 mt-2">
              <button
                onClick={onClearAll}
                className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear All Bookmarks
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

