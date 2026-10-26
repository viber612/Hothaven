import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAdmin,
}) => {
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  const handleLogoTap = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Brand Wordmark (Hidden 3-tap Admin Trigger) */}
          <button
            id="header-logo-btn"
            onClick={handleLogoTap}
            className="flex items-center cursor-pointer focus:outline-none select-none text-left bg-transparent border-0 p-0 shrink-0"
            title="HOTHAVEN"
            aria-label="HOTHAVEN"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-black font-display uppercase whitespace-nowrap">
              HOTHAVEN
            </span>
          </button>

          {/* Clean Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search videos..."
                className="w-full h-10 pl-9 pr-8 bg-white border border-black text-black placeholder:text-black/45 text-sm focus:outline-none transition-all rounded-none"
              />
              <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:opacity-60 p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
