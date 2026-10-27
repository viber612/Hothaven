import React from 'react';
import { VideoItem } from '../types/video';

const AD_IFRAME_SRCDOC = `<!DOCTYPE html>
<html>
<head>
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>
</head>
<body>
<script type="text/javascript">
  atOptions = {
    'key' : '596354a97494c31f5fc935f4e404eded',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://biomanos.org/22/596354a97494c31f5fc935f4e404eded"></script>
</body>
</html>`;

interface HeroFeaturedProps {
  video?: VideoItem;
  onPlay?: (video: VideoItem) => void;
  onToggleBookmark?: (video: VideoItem) => void;
  isBookmarked?: boolean;
  onShare?: (video: VideoItem) => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = () => {
  return (
    <section
      aria-label="Advertisement Placement"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2"
    >
      <div id="top-banner-ad-placement" className="w-full flex justify-center overflow-x-auto">
        <iframe
          srcDoc={AD_IFRAME_SRCDOC}
          title="728x90 Banner Advertisement"
          width="728"
          height="90"
          scrolling="no"
          frameBorder="0"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          loading="lazy"
          className="shrink-0 bg-transparent"
          style={{ border: 0, width: 728, height: 90, maxWidth: 'none' }}
        />
      </div>
    </section>
  );
};
