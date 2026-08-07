import React from 'react';
import { Flame, ShieldAlert, Radio } from 'lucide-react';

interface FooterProps {
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onOpenAgeGate: () => void;
}

export const Footer: React.FC<FooterProps> = ({ isAdmin, onOpenAdminModal, onOpenAgeGate }) => {
  return (
    <footer className="w-full bg-[#08080c] border-t border-white/10 text-slate-400 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <Flame className="w-6 h-6 text-red-500" />
              <span className="text-xl font-black text-white font-display">
                HOT<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400">HAVEN</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded">
                18+ ADULT
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              HOT HAVEN is a high-performance 18+ adult video streaming portal featuring ultra HD media streaming, instant updates, auto-parsed video streams, and responsive dark presentation.
            </p>
          </div>

          {/* Col 2: Compliance & Policy */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              18+ COMPLIANCE
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenAgeGate} className="hover:text-amber-400 transition-colors cursor-pointer">
                  Age Verification Policy
                </button>
              </li>
              <li>
                <span className="text-slate-500">2257 Exemption Record</span>
              </li>
              <li>
                <span className="text-slate-500">Parental Control Guide</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              PORTAL STATUS
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Ultra HD Server Network Online</span>
              </div>
              <p className="text-[11px] text-slate-500">
                100% HD & 4K Streaming Streams Available
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 leading-relaxed mb-6 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500/80 shrink-0 mt-0.5" />
          <div>
            <strong>18+ Content Notice:</strong> All models depicted on this portal were 18 years of age or older at the time of video production. Access is strictly limited to consenting adults in jurisdictions where adult material is lawful.
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>&copy; {new Date().getFullYear()} HOT HAVEN Adult Portal. All Rights Reserved.</span>
          <span className="font-mono text-[10px]">VER: 3.0.0-PROD</span>
        </div>
      </div>
    </footer>
  );
};
