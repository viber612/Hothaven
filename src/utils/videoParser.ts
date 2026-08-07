import { VideoType, VideoCategory } from '../types/video';

export interface ParsedVideoSource {
  embedUrl: string;
  originalUrl: string;
  videoType: VideoType;
  provider: string;
  suggestedThumbnail?: string;
}

export function parseVideoUrl(input: string): ParsedVideoSource {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      embedUrl: '',
      originalUrl: '',
      videoType: 'embed',
      provider: 'Unknown',
    };
  }

  // 1. Check if input is a complete <iframe> or HTML snippet
  let urlToParse = trimmed;
  let isIframeSnippet = false;
  let extractedPoster = '';

  // Extract poster or img src from iframe/HTML snippet if present
  const posterMatch = trimmed.match(/(?:poster|data-poster|thumb|thumbnail)=["']([^"']+)["']/i);
  if (posterMatch && posterMatch[1]) {
    extractedPoster = posterMatch[1];
  } else {
    const imgMatch = trimmed.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      extractedPoster = imgMatch[1];
    }
  }

  if (trimmed.toLowerCase().includes('<iframe') && trimmed.includes('src=')) {
    isIframeSnippet = true;
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      urlToParse = srcMatch[1];
    }
  }

  // Clean URL string
  let url = urlToParse.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://') && !isIframeSnippet) {
    url = 'https://' + url;
  }

  // Check if input is a direct image URL (.jpg, .png, .webp, .jpeg)
  const isDirectImage = /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
  if (isDirectImage) {
    return {
      embedUrl: url,
      originalUrl: trimmed,
      videoType: 'html5',
      provider: 'Direct Image Link',
      suggestedThumbnail: url,
    };
  }

  // 2. Direct HTML5 Video formats (.mp4, .webm, .m3u8, .ogv, .mov)
  const isDirectVideo = /\.(mp4|webm|m3u8|ogv|mov)(\?.*)?$/i.test(url);
  if (isDirectVideo) {
    return {
      embedUrl: url,
      originalUrl: trimmed,
      videoType: 'html5',
      provider: 'HTML5 Media Stream',
      suggestedThumbnail: extractedPoster || undefined,
    };
  }

  // 3. YouTube (watch, shorts, embed, youtu.be)
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`,
      originalUrl: trimmed,
      videoType: 'embed',
      provider: 'YouTube HD',
      suggestedThumbnail: extractedPoster || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 4. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|player\.vimeo\.com\/video\/|)(\d+)/i);
  if (vimeoMatch) {
    const videoId = vimeoMatch[3];
    return {
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
      originalUrl: trimmed,
      videoType: 'embed',
      provider: 'Vimeo HD',
      suggestedThumbnail: extractedPoster || `https://vumbnail.com/${videoId}.jpg`,
    };
  }

  // 5. Dailymotion
  const dailymotionMatch = url.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/i);
  if (dailymotionMatch) {
    const videoId = dailymotionMatch[1];
    return {
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
      originalUrl: trimmed,
      videoType: 'embed',
      provider: 'Dailymotion',
      suggestedThumbnail: extractedPoster || `https://www.dailymotion.com/thumbnail/video/${videoId}`,
    };
  }

  // 6. XVideos
  const xvideosMatch = url.match(/xvideos\.com\/(?:video|embedframe\/)?(\d+)/i);
  if (xvideosMatch) {
    const videoId = xvideosMatch[1];
    return {
      embedUrl: `https://www.xvideos.com/embedframe/${videoId}`,
      originalUrl: trimmed,
      videoType: 'embed',
      provider: 'XVideos HD',
      suggestedThumbnail: extractedPoster || `https://www.xvideos.com/thumbs169poster/${videoId}.jpg`,
    };
  }

  // 7. Pornhub
  const pornhubMatch = url.match(/pornhub\.com\/(?:view_video\.php\?viewkey=|embed\/)([a-zA-Z0-9]+)/i);
  if (pornhubMatch) {
    const viewKey = pornhubMatch[1];
    return {
      embedUrl: `https://www.pornhub.com/embed/${viewKey}`,
      originalUrl: trimmed,
      videoType: 'embed',
      provider: 'Pornhub Network',
      suggestedThumbnail: extractedPoster || undefined,
    };
  }

  // 8. SpankBang
  const spankbangMatch = url.match(/spankbang\.com\/([a-zA-Z0-9]+)\/(?:video|embed)/i);
  if (spankbangMatch) {
    const videoId = spankbangMatch[1];
    return {
      embedUrl: `https://spankbang.com/${videoId}/embed/`,
      originalUrl: trimmed,
      videoType: 'embed',
      provider: 'SpankBang',
      suggestedThumbnail: extractedPoster || undefined,
    };
  }

  // 9. RedTube
  const redtubeMatch = url.match(/redtube\.com\/(?:embed\/\?id=)?(\d+)/i);
  if (redtubeMatch) {
    const videoId = redtubeMatch[1];
    return {
      embedUrl: `https://embed.redtube.com/?id=${videoId}`,
      originalUrl: trimmed,
      videoType: 'embed',
      provider: 'RedTube',
      suggestedThumbnail: extractedPoster || undefined,
    };
  }

  // Fallback: If original was iframe tag or standard URL
  return {
    embedUrl: url,
    originalUrl: trimmed,
    videoType: isIframeSnippet ? 'iframe' : 'embed',
    provider: isIframeSnippet ? 'Iframe Embed Code' : 'Web Stream Player',
    suggestedThumbnail: extractedPoster || undefined,
  };
}

export function getAutoThumbnail(parsed: ParsedVideoSource, category?: VideoCategory): string {
  if (parsed.suggestedThumbnail) return parsed.suggestedThumbnail;

  const categoryCovers: Record<string, string> = {
    Trending: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    Premium: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    VR: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&q=80',
    Solo: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&q=80',
    Amateur: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    HD: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  };
  return categoryCovers[category || 'HD'] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';
}
