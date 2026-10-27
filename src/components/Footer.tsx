import React, { useRef } from 'react';

interface FooterProps {
  onOpenAdminModal: () => void;
  isAdmin?: boolean;
  onOpenAgeGate?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminModal }) => {
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  const handleFooterLogoTap = (e: React.MouseEvent) => {
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
      onOpenAdminModal();
    }
  };

  return (
    <footer
      className="w-full bg-white border-t border-black text-black py-8 mt-12"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <button
          onClick={handleFooterLogoTap}
          className="font-black tracking-tighter text-base text-black font-display uppercase cursor-pointer bg-transparent border-0 p-0 focus:outline-none select-none"
          title="HOTHAVEN"
        >
          HOTHAVEN
        </button>

        <p className="text-black/70 text-center sm:text-right">
          18+ Adult Content Notice · &copy; {new Date().getFullYear()} HOTHAVEN. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
