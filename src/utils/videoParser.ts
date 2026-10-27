import { VideoType, VideoCategory } from '../types/video';

export interface ParsedVideoSource {
  embedUrl: string;
  originalUrl: string;
  videoType: VideoType;
  provider: string;
  suggestedThumbnail?: string;
  suggestedTitle?: string;
  suggestedDuration?: string;
}

export interface RemoteVideoMetadata {
  title?: string;
  thumbnail?: string;
  duration?: string;
  embedUrl?: string;
  cleanUrl?: string;
}

function normalizeDurationString(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const cleaned = String(raw).trim();
  if (!cleaned) return undefined;

  // Already in MM:SS or HH:MM:SS format (e.g. "19:33" or "1:05:20")
  const clockMatch = cleaned.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
  if (clockMatch) {
    return clockMatch[1];
  }

  // ISO 8601 duration (e.g. PT19M33S or PT1H5M12S)
  const isoMatch = cleaned.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (isoMatch) {
    const hours = parseInt(isoMatch[1] || '0', 10);
    const mins = parseInt(isoMatch[2] || '0', 10);
    const secs = parseInt(isoMatch[3] || '0', 10);
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  // Pure seconds (e.g. "1173")
  if (/^\d+$/.test(cleaned)) {
    const totalSeconds = parseInt(cleaned, 10);
    if (totalSeconds > 0 && totalSeconds < 86400) {
      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      if (hours > 0) {
        return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      return `${mins}:${String(secs).padStart(2, '0')}`;
    }
  }

  // "19 min 33 sec" or "19m 33s"
  const minSecMatch = cleaned.match(/(\d+)\s*(?:min|m)\w*\s*(?:(\d+)\s*(?:sec|s)\w*)?/i);
  if (minSecMatch) {
    const mins = parseInt(minSecMatch[1], 10);
    const secs = parseInt(minSecMatch[2] || '0', 10);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  return undefined;
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

  let urlToParse = trimmed;
  let isIframeSnippet = false;
  let extractedPoster = '';
  let extractedTitle = '';
  let extractedDuration = '';

  // 0. Check if input is a BBCode link: [url=https://...]Video Title[/url] or [url]https://...[/url]
  const bbCodeWithTitleMatch = trimmed.match(/\[url=["']?([^\]"']+)["']?\]([\s\S]*?)\[\/url\]/i);
  if (bbCodeWithTitleMatch) {
    urlToParse = bbCodeWithTitleMatch[1].trim();
    extractedTitle = bbCodeWithTitleMatch[2]
      .replace(/\[\/?[a-z0-9]+(?:=[^\]]*)?\]/gi, '')
      .trim();
  } else {
    const bbCodeSimpleMatch = trimmed.match(/\[url\]([\s\S]*?)\[\/url\]/i);
    if (bbCodeSimpleMatch) {
      urlToParse = bbCodeSimpleMatch[1].trim();
    }
  }

  // Check if input is an HTML <a> anchor tag: <a href="https://...">Video Title</a>
  if (!bbCodeWithTitleMatch && trimmed.toLowerCase().includes('<a ') && trimmed.toLowerCase().includes('href=')) {
    const hrefMatch = trimmed.match(/href=["']([^"']+)["']/i);
    const textMatch = trimmed.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
    if (hrefMatch && hrefMatch[1]) {
      urlToParse = hrefMatch[1].trim();
    }
    if (textMatch && textMatch[1]) {
      const stripped = textMatch[1].replace(/<[^>]+>/g, '').trim();
      if (stripped) extractedTitle = stripped;
    }
  }

  // Extract duration if included in text/BBCode (e.g., "(19:33)" or "[19:33]")
  const inlineDurationMatch = trimmed.match(/(?:\(|\[|\b)(\d{1,2}:\d{2}(?::\d{2})?)(?:\)|\]|\b)/);
  if (inlineDurationMatch && !urlToParse.includes(inlineDurationMatch[1])) {
    extractedDuration = inlineDurationMatch[1];
  }

  // 1. Check if input is a complete <iframe> or HTML snippet
  const posterMatch = trimmed.match(/(?:poster|data-poster|thumb|thumbnail)=["']([^"']+)["']/i);
  if (posterMatch && posterMatch[1]) {
    extractedPoster = posterMatch[1];
  } else {
    const imgMatch = trimmed.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      extractedPoster = imgMatch[1];
    }
  }

  if (!extractedTitle) {
    const titleAttrMatch = trimmed.match(/(?:title|alt)=["']([^"']+)["']/i);
    if (titleAttrMatch && titleAttrMatch[1]) {
      extractedTitle = titleAttrMatch[1].trim();
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
      originalUrl: url,
      videoType: 'html5',
      provider: 'Direct Image Link',
      suggestedThumbnail: url,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 2. Direct HTML5 Video formats (.mp4, .webm, .m3u8, .ogv, .mov)
  const isDirectVideo = /\.(mp4|webm|m3u8|ogv|mov)(\?.*)?$/i.test(url);
  if (isDirectVideo) {
    return {
      embedUrl: url,
      originalUrl: url,
      videoType: 'html5',
      provider: 'HTML5 Media Stream',
      suggestedThumbnail: extractedPoster || undefined,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 3. Watch-My-GF (watch-my-gf.com/view_video.php?v=31978 or /embed/31978)
  const watchMyGfMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]*watch-my-gf\.com)\/(?:view_video\.php\?.*?\bv=|embed\/|videos\/)(\d+)/i
  );
  if (watchMyGfMatch) {
    const domain = watchMyGfMatch[1].replace(/^www\./i, '');
    const videoId = watchMyGfMatch[2];
    const folder = Math.floor(Number(videoId) / 1000) * 1000;
    return {
      embedUrl: `https://${domain}/embed/${videoId}`,
      originalUrl: `https://${domain}/view_video.php?v=${videoId}`,
      videoType: 'embed',
      provider: 'WatchMyGF HD',
      suggestedThumbnail:
        extractedPoster ||
        `https://cdn1.${domain}/contents/videos_screenshots/${folder}/${videoId}/preview.mp4.jpg`,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 4. Generic KVS tube sites (view_video.php?v=ID)
  const kvsViewMatch = url.match(/^(https?:\/\/[^\/]+)\/view_video\.php\?.*?\bv=(\d+)/i);
  if (kvsViewMatch) {
    const origin = kvsViewMatch[1];
    const host = origin.replace(/^https?:\/\/(www\.)?/i, '');
    const videoId = kvsViewMatch[2];
    const folder = Math.floor(Number(videoId) / 1000) * 1000;
    return {
      embedUrl: `${origin}/embed/${videoId}`,
      originalUrl: url,
      videoType: 'embed',
      provider: host,
      suggestedThumbnail:
        extractedPoster ||
        `${origin}/contents/videos_screenshots/${folder}/${videoId}/preview.mp4.jpg`,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 5. YouTube (watch, shorts, embed, youtu.be)
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`,
      originalUrl: url,
      videoType: 'embed',
      provider: 'YouTube HD',
      suggestedThumbnail: extractedPoster || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 6. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|player\.vimeo\.com\/video\/|)(\d+)/i);
  if (vimeoMatch) {
    const videoId = vimeoMatch[3];
    return {
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
      originalUrl: url,
      videoType: 'embed',
      provider: 'Vimeo HD',
      suggestedThumbnail: extractedPoster || `https://vumbnail.com/${videoId}.jpg`,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 7. Dailymotion
  const dailymotionMatch = url.match(/dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/i);
  if (dailymotionMatch) {
    const videoId = dailymotionMatch[1];
    return {
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
      originalUrl: url,
      videoType: 'embed',
      provider: 'Dailymotion',
      suggestedThumbnail: extractedPoster || `https://www.dailymotion.com/thumbnail/video/${videoId}`,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 8. XVideos
  const xvideosMatch = url.match(/xvideos\.com\/(?:video|embedframe\/)?(\d+)/i);
  if (xvideosMatch) {
    const videoId = xvideosMatch[1];
    return {
      embedUrl: `https://www.xvideos.com/embedframe/${videoId}`,
      originalUrl: url,
      videoType: 'embed',
      provider: 'XVideos HD',
      suggestedThumbnail: extractedPoster || `https://www.xvideos.com/thumbs169poster/${videoId}.jpg`,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 9. Pornhub
  const pornhubMatch = url.match(/pornhub\.com\/(?:view_video\.php\?viewkey=|embed\/)([a-zA-Z0-9]+)/i);
  if (pornhubMatch) {
    const viewKey = pornhubMatch[1];
    return {
      embedUrl: `https://www.pornhub.com/embed/${viewKey}`,
      originalUrl: url,
      videoType: 'embed',
      provider: 'Pornhub Network',
      suggestedThumbnail: extractedPoster || undefined,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 10. SpankBang
  const spankbangMatch = url.match(/spankbang\.com\/([a-zA-Z0-9]+)\/(?:video|embed)/i);
  if (spankbangMatch) {
    const videoId = spankbangMatch[1];
    return {
      embedUrl: `https://spankbang.com/${videoId}/embed/`,
      originalUrl: url,
      videoType: 'embed',
      provider: 'SpankBang',
      suggestedThumbnail: extractedPoster || undefined,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // 11. RedTube
  const redtubeMatch = url.match(/redtube\.com\/(?:embed\/\?id=)?(\d+)/i);
  if (redtubeMatch) {
    const videoId = redtubeMatch[1];
    return {
      embedUrl: `https://embed.redtube.com/?id=${videoId}`,
      originalUrl: url,
      videoType: 'embed',
      provider: 'RedTube',
      suggestedThumbnail: extractedPoster || undefined,
      suggestedTitle: extractedTitle || undefined,
      suggestedDuration: extractedDuration || undefined,
    };
  }

  // Fallback: If original was iframe tag or standard URL
  return {
    embedUrl: url,
    originalUrl: url,
    videoType: isIframeSnippet ? 'iframe' : 'embed',
    provider: isIframeSnippet ? 'Iframe Embed Code' : 'Web Stream Player',
    suggestedThumbnail: extractedPoster || undefined,
    suggestedTitle: extractedTitle || undefined,
    suggestedDuration: extractedDuration || undefined,
  };
}

function extractMetaFromHtml(html: string): RemoteVideoMetadata {
  const meta: RemoteVideoMetadata = {};
  const metaTag = (property: string): string => {
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i'),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m && m[1].trim()) return m[1].trim();
    }
    return '';
  };

  const decodeEntities = (s: string): string =>
    s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;|&apos;|&#x27;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

  let title = metaTag('og:title') || metaTag('twitter:title');
  if (!title) {
    const tMatch = html.match(/<title[^>]*>([\s\S]{1,300}?)<\/title>/i);
    if (tMatch) title = tMatch[1].trim();
  }
  if (title) {
    // Strip common site-name suffixes like " - Pornhub.com"
    title = decodeEntities(
      title.replace(/\s*[-|–]\s*(Pornhub|xVideos|xHamster|SpankBang|RedTube|YouPorn|YouTube|XNXX|Eporner|HQporner)$/i, '').trim()
    );
    meta.title = title;
  }

  let thumb =
    metaTag('og:image:secure_url') ||
    metaTag('og:image') ||
    metaTag('twitter:image') ||
    metaTag('twitter:image:src');
  if (!thumb) {
    // JSON-LD thumbnailUrl / image fields
    const jsonLdThumb = html.match(
      /"(?:thumbnailUrl|thumbnail|image|previewUrl|poster)"\s*:\s*"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif)[^"]*)"/i
    );
    if (jsonLdThumb) thumb = jsonLdThumb[1];
  }
  if (!thumb) {
    // KVS-style inline JS: image / poster / preview / thumb vars
    const jsThumb = html.match(
      /(?:image|poster|thumbnail|thumb|preview|cover)["']?\s*[:=]\s*["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/i
    );
    if (jsThumb) thumb = jsThumb[1];
  }
  if (thumb) meta.thumbnail = thumb;

  // Duration: meta tags, JSON-LD (ISO-8601 or seconds), or DOM text
  let duration = metaTag('og:video:duration') || metaTag('video:duration') || metaTag('duration');
  if (!duration) {
    const ldMatch = html.match(/"duration"\s*:\s*"(PT[^"]+)"/i);
    if (ldMatch) duration = normalizeDurationString(ldMatch[1]) || '';
  }
  if (!duration) {
    // duration as raw seconds inside JSON, e.g. "duration":1234
    const secMatch = html.match(/"duration"\s*:\s*(\d{2,6})\s*[,}]/i);
    if (secMatch) {
      const total = parseInt(secMatch[1], 10);
      if (total > 30 && total < 43200) {
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        duration = h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${m}:${String(s).padStart(2, '0')}`;
      }
    }
  }
  if (!duration) {
    const durMatch = html.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
    if (durMatch) duration = durMatch[1];
  }
  if (duration) meta.duration = duration;

  return meta;
}

function extractMetaFromText(text: string): RemoteVideoMetadata {
  const meta: RemoteVideoMetadata = {};
  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  if (titleMatch && titleMatch[1].trim()) meta.title = titleMatch[1].trim();
  const imgMatch = text.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+\.(?:jpg|jpeg|png|webp)[^\s)]*)\)/i);
  if (imgMatch && imgMatch[1]) meta.thumbnail = imgMatch[1];
  if (!meta.thumbnail) {
    const thumbUrlMatch = text.match(/(https?:\/\/[^\s"'()]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'()]*)?)/i);
    if (thumbUrlMatch) meta.thumbnail = thumbUrlMatch[1];
  }
  const durMatch = text.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
  if (durMatch) meta.duration = durMatch[1];
  return meta;
}

async function fetchWithTimeout(url: string, ms = 9000): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchMetaViaMicrolink(url: string): Promise<RemoteVideoMetadata> {
  const meta: RemoteVideoMetadata = {};
  const durationSelector = '.v-duration, .duration, .video-duration, [itemprop="duration"], .time';
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(
    url
  )}&data.duration.selector=${encodeURIComponent(durationSelector)}&data.duration.type=text`;
  const response = await fetchWithTimeout(endpoint);
  if (!response) return meta;
  const json = await response.json().catch(() => null);
  if (json && json.status === 'success' && json.data) {
    const data = json.data;
    if (!meta.title && typeof data.title === 'string' && data.title.trim()) {
      meta.title = data.title.trim();
    }
    if (data.image && typeof data.image.url === 'string' && data.image.url.trim()) {
      meta.thumbnail = data.image.url.trim();
    }
    const normalizedDur = normalizeDurationString(data.duration);
    if (normalizedDur) {
      meta.duration = normalizedDur;
    }
  }
  return meta;
}

async function fetchMetaViaJina(url: string): Promise<RemoteVideoMetadata> {
  const response = await fetchWithTimeout(`https://r.jina.ai/${url}`);
  if (!response) return {};
  const text = await response.text();
  if (!text) return {};
  return extractMetaFromText(text);
}

type ProxyKind = 'allorigins' | 'allorigins-get' | 'corsproxy' | 'codetabs';

async function fetchMetaViaHtmlProxy(url: string, proxy: ProxyKind): Promise<RemoteVideoMetadata> {
  let proxied: string;
  let parseJson = false;
  switch (proxy) {
    case 'allorigins':
      proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      break;
    case 'allorigins-get':
      proxied = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      parseJson = true;
      break;
    case 'corsproxy':
      proxied = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
      break;
    case 'codetabs':
      proxied = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
      break;
  }
  const response = await fetchWithTimeout(proxied);
  if (!response) return {};
  let payload = await response.text();
  if (!payload) return {};
  if (parseJson) {
    try {
      const json = JSON.parse(payload);
      payload = typeof json?.contents === 'string' ? json.contents : '';
    } catch {
      payload = '';
    }
  }
  if (!payload) return {};
  return extractMetaFromHtml(payload);
}

function getInstantThumbnail(url: string): string {
  // YouTube thumbnails can be constructed directly without any network fetch
  const yt = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (yt) return `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`;
  return '';
}

export async function fetchRemoteVideoMetadata(input: string): Promise<RemoteVideoMetadata> {
  const parsed = parseVideoUrl(input);
  const result: RemoteVideoMetadata = {
    title: parsed.suggestedTitle,
    thumbnail: parsed.suggestedThumbnail,
    duration: parsed.suggestedDuration,
    embedUrl: parsed.embedUrl,
    cleanUrl: parsed.originalUrl,
  };

  if (!parsed.originalUrl || !parsed.originalUrl.startsWith('http')) {
    return result;
  }

  // Guarantee a thumbnail when nothing else provides one
  if (!result.thumbnail) {
    const instant = getInstantThumbnail(parsed.originalUrl);
    if (instant) result.thumbnail = instant;
  }

  // Run ALL providers in parallel (fast), then merge results in priority
  // order so earlier providers win for any field they found.
  const providers: Array<() => Promise<RemoteVideoMetadata>> = [
    () => fetchMetaViaMicrolink(parsed.originalUrl),
    () => fetchMetaViaHtmlProxy(parsed.originalUrl, 'allorigins'),
    () => fetchMetaViaHtmlProxy(parsed.originalUrl, 'corsproxy'),
    () => fetchMetaViaHtmlProxy(parsed.originalUrl, 'codetabs'),
    () => fetchMetaViaHtmlProxy(parsed.originalUrl, 'allorigins-get'),
    () => fetchMetaViaJina(parsed.originalUrl),
  ];

  const settled = await Promise.allSettled(providers.map((p) => p()));

  for (const outcome of settled) {
    if (outcome.status !== 'fulfilled' || !outcome.value) continue;
    const meta = outcome.value;
    if (!result.title && meta.title) result.title = meta.title;
    if (!result.thumbnail && meta.thumbnail) result.thumbnail = meta.thumbnail;
    if (!result.duration && meta.duration) result.duration = meta.duration;
  }

  return result;
}

export const fetchVideoMetadataFromUrl = fetchRemoteVideoMetadata;

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
