import React from 'react';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ isOpen, onConfirm }) => {
  const [declined, setDeclined] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-black rounded-none p-6 sm:p-8 text-black text-center">
        {!declined ? (
          <>
            <p className="text-xs font-mono uppercase tracking-widest text-black/70 mb-2">
              18+ Adult Content Verification
            </p>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black mb-3 font-display uppercase">
              HOTHAVEN
            </h2>

            <p className="text-black/80 text-sm leading-relaxed mb-6">
              This website contains adult material intended solely for individuals at least <strong>18 years of age</strong>.
            </p>

            <div className="space-y-2.5">
              <button
                id="age-gate-confirm-btn"
                onClick={onConfirm}
                className="w-full py-3 px-6 rounded-none font-bold text-white bg-black hover:bg-white hover:text-black border border-black transition-colors text-sm cursor-pointer"
              >
                I am 18 or older — Enter
              </button>

              <button
                id="age-gate-exit-btn"
                onClick={() => setDeclined(true)}
                className="w-full py-3 px-6 rounded-none font-bold text-black bg-white hover:bg-black hover:text-white border border-black transition-colors text-sm cursor-pointer"
              >
                Exit
              </button>
            </div>
          </>
        ) : (
          <div className="py-4">
            <h3 className="text-xl font-bold text-black mb-2">Access Restricted</h3>
            <p className="text-black/70 text-sm mb-6">
              You must be at least 18 years old to enter.
            </p>
            <button
              onClick={() => setDeclined(false)}
              className="px-6 py-2.5 bg-black text-white border border-black text-xs font-bold uppercase cursor-pointer"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
