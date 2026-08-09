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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                <Bookmark className="w-5 h-5 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Saved Videos</h3>
                <p className="text-xs text-slate-500 font-mono">{bookmarks.length} videos stored locally</p>
              </div>
            </div>

            <button
              id="close-bookmarks-btn"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content list */}
          {bookmarks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bookmark className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No Saved Videos Yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click the bookmark icon on any video thumbnail or player to save it here for fast access.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
                {bookmarks.map((video) => {
                  const likePct = getLikePercentage(video);
                  return (
                    <div
                      key={video.id}
                      className="group flex gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-300 transition-all"
                    >
                      <div
                        onClick={() => {
                          onSelectVideo(video);
                          onClose();
                        }}
                        className="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 cursor-pointer flex items-center justify-center"
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title || "Thumbnail"}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                          <div className="w-7 h-7 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow-md group-hover:bg-orange-500 group-hover:text-white transition-all">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                        {video.duration && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-white font-mono text-[9px] font-bold z-10">
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
                            className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1 cursor-pointer"
                          >
                            {video.title || 'HD Video Stream'}
                          </h4>
                          <button
                            onClick={() => onRemoveBookmark(video)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                            title="Remove Bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 text-slate-600 font-mono">
                            <Eye className="w-3 h-3 text-orange-500" />
                            {formatViews(video.views)}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-orange-600 font-mono font-bold">
                            <Heart className="w-3 h-3 fill-orange-500" />
                            {likePct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-auto">
                <button
                  id="clear-all-bookmarks-btn"
                  onClick={onClearAll}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Bookmarks
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
