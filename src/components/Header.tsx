import React, { useState, useRef } from 'react';
import {
  Flame,
  Search,
  Lock,
  Unlock,
  Bookmark,
  ShieldCheck,
  PlusCircle,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { VideoCategory } from '../types/video';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  bookmarkedCount: number;
  onOpenBookmarks: () => void;
  onOpenAgeGate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  isAdmin,
  onOpenAdminModal,
  bookmarkedCount,
  onOpenBookmarks,
  onOpenAgeGate,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Hidden admin access trigger: tap logo icon 3 times quickly
  const handleLogoClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const nextCount = clickCount + 1;
    if (nextCount >= 3) {
      setClickCount(0);
      onOpenAdminModal();
    } else {
      setClickCount(nextCount);
      timerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1500);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0e]/95 backdrop-blur-md border-b border-white/10">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div
              className="flex items-center gap-3 cursor-pointer group select-none active:scale-95 transition-transform"
              onClick={handleLogoClick}
              title="HOT HAVEN (Tap 3 times for Admin Portal)"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-red-600/40">
                <div className="w-full h-full bg-[#0d0d12] rounded-[10px] flex items-center justify-center transition-transform group-hover:scale-95">
                  <Flame className="w-6 h-6 text-red-500 animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white font-display">
                    HOT<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400">HAVEN</span>
                  </h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded uppercase tracking-widest">
                    18+
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  ULTRA HD ADULT STREAMING
                </p>
              </div>
            </div>

            {/* Mobile Header Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onOpenBookmarks}
                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                title="Saved Videos"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                {bookmarkedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {bookmarkedCount}
                  </span>
                )}
              </button>

              {isAdmin && (
                <button
                  onClick={onOpenAdminModal}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
                  title="Open Admin Panel"
                >
                  Admin Active
                </button>
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search videos..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#161622] border border-white/10 text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Saved Bookmarks */}
            <button
              onClick={onOpenBookmarks}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Saved</span>
              {bookmarkedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-bold rounded-full">
                  {bookmarkedCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={onOpenAdminModal}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Open Admin Panel"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Admin Mode</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
