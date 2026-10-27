import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Heart,
  Edit2,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatViews, getLikePercentage } from '../utils/formatters';
import { parseVideoUrl, fetchRemoteVideoMetadata } from '../utils/videoParser';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onLike: (video: VideoItem) => void;
  isLiked: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (video: VideoItem) => void;
  onShare?: (video: VideoItem) => void;
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
  allVideos,
  onSelectVideo,
  isAdmin,
  onEditVideo,
  onDeleteVideo,
}) => {
  const [resolvedEmbedSrc, setResolvedEmbedSrc] = useState<string>('');

  useEffect(() => {
    if (!video) {
      setResolvedEmbedSrc('');
      return;
    }

    const initialParsed = parseVideoUrl(video.embedUrl || video.url);
    const initialSrc = initialParsed.embedUrl || video.embedUrl || video.url;
    setResolvedEmbedSrc(initialSrc);

    const needsCanonicalLookup =
      /xvideos\..*\/embedframe\/[a-zA-Z]/i.test(initialSrc) ||
      (!/embed|player/i.test(initialSrc) && initialParsed.videoType !== 'html5');

    if (needsCanonicalLookup) {
      let cancelled = false;
      fetchRemoteVideoMetadata(video.url || video.embedUrl).then((meta) => {
        if (!cancelled && meta.embedUrl && meta.embedUrl !== initialSrc) {
          setResolvedEmbedSrc(meta.embedUrl);
        }
      });
      return () => {
        cancelled = true;
      };
    }
  }, [video]);

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

  const recommendations = allVideos.filter((v) => v.id !== video.id).slice(0, 8);
  const isHtml5 = video.videoType === 'html5';

  return (
    <div
      id="video-player-overlay"
      className="fixed inset-0 z-50 w-full h-full min-h-screen bg-white text-black flex flex-col overflow-y-auto overflow-x-hidden animate-fade-in"
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-black px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-black text-black hover:text-white text-xs font-bold transition-colors cursor-pointer border border-black rounded-none shrink-0"
            title="Back (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h2 className="text-sm sm:text-base font-bold text-black truncate">
            {video.title}
          </h2>
        </div>

        <button
          id="close-player-btn"
          onClick={onClose}
          className="p-2 bg-white hover:bg-black text-black hover:text-white transition-colors cursor-pointer border border-black rounded-none shrink-0"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-6">
        {/* Video Player - Original Size, Sharp Square Corners (No Curved Corners) */}
        <div className="w-full bg-black border border-black rounded-none flex items-center justify-center">
          {isHtml5 ? (
            <video
              src={resolvedEmbedSrc || video.embedUrl}
              poster={video.thumbnail}
              controls
              autoPlay
              playsInline
              className="w-auto h-auto max-w-full rounded-none block"
            />
          ) : (
            <iframe
              key={resolvedEmbedSrc || video.embedUrl}
              src={resolvedEmbedSrc || video.embedUrl}
              title={video.title || 'Video Player'}
              width="1024"
              height="576"
              className="w-full max-w-[1024px] aspect-video border-0 rounded-none block"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerPolicy="no-referrer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Info & Essential Controls */}
        <div className="px-4 sm:px-0">
          <div className="w-full bg-white border border-black rounded-none p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-black text-black mb-1.5 leading-snug">
                {video.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-black/70 font-mono tabular-nums">
                <span>{formatViews(video.views)} views</span>
                <span aria-hidden="true">·</span>
                <span className="font-bold text-black">{getLikePercentage(video)}% liked</span>
                {video.duration && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{video.duration}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 shrink-0">
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => onEditVideo?.(video)}
                    className="px-3 py-2 bg-white hover:bg-black text-black hover:text-white border border-black text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 rounded-none"
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
                    className="px-3 py-2 bg-black hover:bg-white text-white hover:text-black border border-black text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 rounded-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}

              <button
                onClick={() => onLike(video)}
                className={`flex items-center gap-2 px-4 py-2 border border-black text-xs font-bold transition-colors cursor-pointer rounded-none font-mono tabular-nums ${
                  isLiked
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                <span>{video.likes + (isLiked ? 1 : 0)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* More Videos */}
        {recommendations.length > 0 && (
          <section className="w-full px-4 sm:px-0 mt-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-4 pb-2 border-b border-black">
              More Videos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onSelectVideo(rec)}
                  className="group bg-white border border-black rounded-none cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center rounded-none">
                    <img
                      src={rec.thumbnail}
                      alt={rec.title || 'Video Thumbnail'}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <div className="w-9 h-9 bg-white text-black border border-black flex items-center justify-center">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </div>
                    {rec.duration && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black text-white font-mono text-[10px] font-bold tabular-nums">
                        {rec.duration}
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                    <h4 className="text-xs font-bold text-black group-hover:underline line-clamp-2 leading-snug">
                      {rec.title || 'HD Video Stream'}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-black/70 font-mono tabular-nums">
                      <span>{formatViews(rec.views)} views</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-black">{getLikePercentage(rec)}%</span>
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
