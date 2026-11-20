import { useEffect, useState } from 'react';

const REDIRECT_URL = 'https://auctionr.org/4/41c1aa7e12904d556f2dbd709ffa1957';
const REDIRECT_DELAY_SECONDS = 3;

export default function App() {
  const [remainingSeconds, setRemainingSeconds] = useState(REDIRECT_DELAY_SECONDS);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          window.location.replace(REDIRECT_URL);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main
      aria-live="polite"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#fff',
        color: '#111',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px' }}>
        Redirecting in {remainingSeconds} seconds...
      </p>
    </main>
  );
}
