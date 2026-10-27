import React from 'react';
import { VideoItem } from '../types/video';

interface HeroFeaturedProps {
  video?: VideoItem;
  onPlay?: (video: VideoItem) => void;
  onToggleBookmark?: (video: VideoItem) => void;
  isBookmarked?: boolean;
  onShare?: (video: VideoItem) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = () => {
  return (
    <section
      aria-label="Advertisement Placement"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2"
    >
      <div
        id="top-banner-ad-placement"
        className="w-full min-h-[90px] sm:min-h-[110px] bg-white border border-black flex flex-col items-center justify-center p-4 text-center select-none"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-black/60 mb-1">
          Advertisement
        </span>
        <div className="text-sm sm:text-base font-bold tracking-tight text-black uppercase font-display">
          Banner Ad Placement (728 × 90)
        </div>
      </div>
    </section>
  );
};
