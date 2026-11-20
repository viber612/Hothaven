import React from 'react';

export const HeroFeatured: React.FC = () => {
  return (
    <section
      aria-label="Advertisement Placement"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2"
    >
      <div id="top-banner-ad-placement" className="relative w-full min-h-[90px] sm:min-h-[110px] overflow-hidden bg-black border border-black flex items-center justify-center text-center select-none">
        <img
          src="https://i.ibb.co/6RKkYQ1r/HVCYn-Hzbg-AA3-Rt-M.jpg"
          alt="HOT HAVEN preview"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="relative z-10 rounded-lg bg-black/60 px-5 py-3 text-white backdrop-blur-sm">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-white/70 mb-1">
            HOT HAVEN
          </span>
          <div className="text-sm sm:text-base font-bold tracking-tight uppercase font-display">
            Banner Ad Placement (728 × 90)
          </div>
        </div>
      </div>
    </section>
  );
};
