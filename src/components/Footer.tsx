import React, { useRef } from 'react';
import { Flame, ShieldAlert, Radio, Search, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onOpenAgeGate: () => void;
}

export const Footer: React.FC<FooterProps> = ({ isAdmin, onOpenAdminModal, onOpenAgeGate }) => {
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
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 py-12 mt-16" itemScope itemType="https://schema.org/WPFooter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2">
            <button
              onClick={handleFooterLogoTap}
              className="flex items-center gap-2.5 mb-3 group cursor-pointer focus:outline-none select-none text-left bg-transparent border-0 p-0"
              title="HOT HAVEN (Tap 3x for Admin)"
              aria-label="HOT HAVEN Logo"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center group-hover:bg-orange-600 active:scale-95 transition-all">
                <Flame className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 font-display">
                HOT<span className="text-orange-500">HAVEN</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-md">
                18+ ADULT
              </span>
            </button>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mb-4">
              HOT HAVEN is a high-performance 18+ adult video streaming portal featuring HD and 4K media streaming, daily trending video updates, auto-parsed video streams, and a fast, responsive interface.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">HD Streaming</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">4K Ultra HD</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Fast Playback</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Mobile Ready</span>
            </div>
          </div>

          {/* Col 2: Compliance & Policy */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              18+ COMPLIANCE & LEGAL
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <button
                  onClick={onOpenAgeGate}
                  className="hover:text-orange-600 transition-colors cursor-pointer text-left"
                >
                  Age Verification Policy
                </button>
              </li>
              <li>
                <span>18 U.S.C. 2257 Exemption Record</span>
              </li>
              <li>
                <span>Parental Control Guide</span>
              </li>
              <li>
                <span>DMCA Notice & Content Removal</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Info & SEO */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              STREAM NETWORK
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ultra HD Server Network Online</span>
              </div>
              <p className="text-[11px] text-slate-500">
                100% Free HD and 4K streaming streams available without subscription.
              </p>
              <div className="pt-2">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-orange-600 hover:underline font-semibold"
                >
                  XML Sitemap for Search Engines
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Category Cloud / Keywords Index for Google Search Ranking */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 mb-6">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-2">
            <Search className="w-3.5 h-3.5 text-orange-500" />
            <span>Popular Search Tags & Video Categories:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {[
              'HD Adult Videos',
              'Free 4K Streaming',
              'Trending Adult Clips',
              'Full Length Movies',
              'Top Rated Streams',
              'Most Viewed Adult Videos',
              'New Releases 2026',
              'HD Mobile Streaming',
              'Fast Video Portal',
              'Responsive Video Player',
              'Hot Haven Direct Stream'
            ].map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 text-[11px] text-slate-600 leading-relaxed mb-6 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">18+ Content Notice:</strong> All models depicted on this portal were 18 years of age or older at the time of video production. Access is strictly limited to consenting adults in jurisdictions where adult material is lawful.
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>&copy; {new Date().getFullYear()} HOT HAVEN Adult Portal. All Rights Reserved.</span>
          <span className="font-mono text-[10px] text-slate-400">CLEAN WHITE & ORANGE THEME</span>
        </div>
      </div>
    </footer>
  );
};
