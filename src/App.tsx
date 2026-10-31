import React from 'react';

const DOWNLOAD_URL = 'https://auctionr.org/4/41c1aa7e12904d556f2dbd709ffa1957';

export default function App() {
  const handleDownload = () => {
    window.location.assign(DOWNLOAD_URL);
  };

  return (
    <main className="download-page">
      <button
        type="button"
        className="download-button"
        onClick={handleDownload}
        aria-label="Download"
      >
        <span>Download</span>
        <svg
          className="download-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      </button>
    </main>
  );
}
