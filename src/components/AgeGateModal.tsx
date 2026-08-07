import React from 'react';
import { ShieldAlert, CheckCircle2, Flame, AlertCircle, ExternalLink } from 'lucide-react';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ isOpen, onConfirm }) => {
  const [declined, setDeclined] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92 backdrop-blur-xl animate-fade-in">
      {/* Decorative neon glow */}
      <div className="absolute w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none -top-10 -left-10"></div>
      <div className="absolute w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none -bottom-10 -right-10"></div>

      <div className="relative w-full max-w-lg bg-[#14141c] border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 text-white text-center">
        {!declined ? (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 p-0.5 mb-5 shadow-lg shadow-red-600/30">
              <div className="w-full h-full bg-[#14141c] rounded-[14px] flex items-center justify-center">
                <Flame className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              18+ Adult Content Verification
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 font-display">
              WELCOME TO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-400">HOT HAVEN</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              This portal contains explicit adult entertainment materials intended solely for mature individuals. By entering, you certify under penalty of perjury that you are at least <strong>18 years of age</strong> (or age of majority in your jurisdiction).
            </p>

            <div className="space-y-3">
              <button
                onClick={onConfirm}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                I am 18 or older - Enter Portal
              </button>

              <button
                onClick={() => setDeclined(true)}
                className="w-full py-3 px-6 rounded-xl font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm cursor-pointer"
              >
                I am under 18 - Exit
              </button>
            </div>

            <p className="mt-5 text-xs text-slate-500">
              By proceeding, you agree to our Terms of Access & Content Disclaimer. Your preference will be saved locally.
            </p>
          </>
        ) : (
          <div className="py-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Access Restricted</h3>
            <p className="text-slate-300 text-sm mb-6">
              You must be at least 18 years old to access HOT HAVEN content.
            </p>
            <a
              href="https://www.google.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
            >
              Exit to Safe Web <ExternalLink className="w-4 h-4" />
            </a>
            <div className="mt-4">
              <button
                onClick={() => setDeclined(false)}
                className="text-xs text-red-400 hover:underline cursor-pointer"
              >
                Re-verify Age
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
