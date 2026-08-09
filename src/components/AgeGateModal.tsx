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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-900 text-center">
        {!declined ? (
          <>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 text-white mb-4 shadow-md shadow-orange-500/20">
              <Flame className="w-8 h-8 fill-white text-white" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              18+ Adult Content Verification
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2 font-display">
              WELCOME TO <span className="text-orange-500">HOT HAVEN</span>
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              This portal contains adult entertainment materials intended solely for mature individuals. By entering, you certify under penalty of perjury that you are at least <strong>18 years of age</strong> (or the age of majority in your jurisdiction).
            </p>

            <div className="space-y-2.5">
              <button
                id="age-gate-confirm-btn"
                onClick={onConfirm}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/25 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                I am 18 or older - Enter Portal
              </button>

              <button
                id="age-gate-exit-btn"
                onClick={() => setDeclined(true)}
                className="w-full py-3 px-6 rounded-xl font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors text-sm cursor-pointer"
              >
                I am under 18 - Exit
              </button>
            </div>

            <p className="mt-5 text-xs text-slate-400">
              By proceeding, you agree to our Terms of Access & Content Disclaimer. Your preference will be saved locally.
            </p>
          </>
        ) : (
          <div className="py-4">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h3>
            <p className="text-slate-600 text-sm mb-6">
              You must be at least 18 years old to access HOT HAVEN content.
            </p>
            <a
              href="https://www.google.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors"
            >
              Exit to Safe Web <ExternalLink className="w-4 h-4" />
            </a>
            <div className="mt-4">
              <button
                onClick={() => setDeclined(false)}
                className="text-xs text-orange-600 hover:underline cursor-pointer font-medium"
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
