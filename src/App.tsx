import React, { useEffect } from 'react';

const SIGNUP_URL = 'https://s.hifamiapp.com/1/lO02cUcjh';
const REFERRAL_CODE = 'lO02cUcjh';

export default function App() {
  useEffect(() => {
    const adScripts = [
      {
        id: 'adsterra-popupunder',
        src: 'https://ahuramazda.org/1/39ff01062750ca6bad180fa471aa4d80',
      },
      {
        id: 'adsterra-socialbar',
        src: 'https://brijmohan.org/14/b81de2fcf2e8ecd721bdee9d28d048b8',
      },
    ];

    adScripts.forEach(({ id, src }) => {
      if (document.getElementById(id)) return;

      const script = document.createElement('script');
      script.id = id;
      script.async = false;
      script.setAttribute('data-cfasync', 'false');
      script.src = src;
      document.body.appendChild(script);
    });
  }, []);

  const handleSignup = () => {
    window.location.assign(SIGNUP_URL);
  };

  return (
    <main className="glass-page">
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
      <div className="ambient-orb ambient-orb-two" aria-hidden="true" />

      <section className="glass-card" aria-labelledby="welcome-title">
        <div className="card-badge">
          <span className="badge-dot" aria-hidden="true" />
          Welcome offer
        </div>

        <h1 id="welcome-title">Get $10 free</h1>
        <p className="card-copy">
          Sign up through the button below and use the referral code to claim your free $10 offer.
        </p>

        <div className="code-panel" aria-label={`Referral code ${REFERRAL_CODE}`}>
          <span className="code-label">Referral code</span>
          <strong>{REFERRAL_CODE}</strong>
        </div>

        <button type="button" className="signup-button" onClick={handleSignup}>
          <span>Sign up &amp; claim $10</span>
          <svg
            className="arrow-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>

        <p className="fine-print">Offer availability and eligibility are determined by the signup service.</p>
      </section>
    </main>
  );
}
