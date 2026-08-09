import React, { useState, useRef } from 'react';
import {
  Flame,
  Search,
  Bookmark,
  Shield,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { SortOption } from '../types/video';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  bookmarkCount,
  onOpenBookmarks,
  onOpenAdmin,
  isAdmin,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  const sortLabels: Record<SortOption, string> = {
    latest: 'Newest Releases',
    views: 'Most Viewed',
    likes: 'Top Rated',
    featured: 'Featured First',
  };

  const handleLogoTap = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    // Check if subsequent taps are within 700ms of the previous tap
    if (now - lastTapTimeRef.current < 700) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      onOpenAdmin();
    } else if (tapCountRef.current === 1) {
      // If single click, scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-orange-100 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Logo & Brand with 3-times Tap to Open Admin */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              id="header-logo-btn"
              onClick={handleLogoTap}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none select-none text-left bg-transparent border-0 p-0"
              title="HOT HAVEN (Tap 3x for Admin)"
              aria-label="HOT HAVEN Logo"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:bg-orange-600 active:scale-95 transition-all">
                <Flame className="w-6 h-6 fill-white text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display leading-none">
                  HOT<span className="text-orange-500">HAVEN</span>
                </span>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider leading-tight">
                  HD Video Portal
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar - Clean, Crisp, High Contrast */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search thousands of HD adult videos, tags, creators..."
                className="w-full h-10 sm:h-11 pl-10 pr-9 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sort Selector Dropdown */}
            <div className="relative">
              <button
                id="sort-toggle-button"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="h-10 px-3.5 rounded-full border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                title="Sort videos"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Sort Videos By
                  </div>
                  {(['latest', 'views', 'likes', 'featured'] as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      id={`sort-option-${opt}`}
                      onClick={() => {
                        onSortChange(opt);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                        sortBy === opt
                          ? 'text-orange-600 bg-orange-50 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sortLabels[opt]}
                      {sortBy === opt && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Bookmarks Button */}
            <button
              id="bookmarks-button"
              onClick={onOpenBookmarks}
              className="h-10 px-3.5 rounded-full border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              title="View Bookmarks"
            >
              <Bookmark className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden md:inline">Saved</span>
              {bookmarkCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* Admin Key Button */}
            <button
              id="admin-button"
              onClick={onOpenAdmin}
              className={`h-10 px-3.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAdmin
                  ? 'border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={isAdmin ? 'Admin Dashboard (Active)' : 'Admin Access'}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Manage'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
