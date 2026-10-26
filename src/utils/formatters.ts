export function formatViews(views?: number | null): string {
  const safeViews = typeof views === 'number' && Number.isFinite(views) ? views : 0;
  if (safeViews >= 1_000_000) {
    const val = (safeViews / 1_000_000).toFixed(1);
    return `${val.replace(/\.0$/, '')}M`;
  }
  if (safeViews >= 1_000) {
    const val = (safeViews / 1_000).toFixed(1);
    return `${val.replace(/\.0$/, '')}K`;
  }
  return safeViews.toLocaleString();
}

export function formatLikes(likes?: number | null): string {
  const safeLikes = typeof likes === 'number' && Number.isFinite(likes) ? likes : 0;
  if (safeLikes >= 1_000_000) {
    const val = (safeLikes / 1_000_000).toFixed(1);
    return `${val.replace(/\.0$/, '')}M`;
  }
  if (safeLikes >= 1_000) {
    const val = (safeLikes / 1_000).toFixed(1);
    return `${val.replace(/\.0$/, '')}K`;
  }
  return safeLikes.toLocaleString();
}

export function getLikePercentage(
  video?: { views?: number; likes?: number; likePercentage?: number } | null
): number {
  if (!video || typeof video !== 'object') return 97;
  if (
    typeof video.likePercentage === 'number' &&
    video.likePercentage > 0 &&
    video.likePercentage <= 100
  ) {
    return video.likePercentage;
  }
  if (
    typeof video.views === 'number' &&
    video.views > 0 &&
    typeof video.likes === 'number' &&
    video.likes > 0
  ) {
    const pct = Math.round((video.likes / video.views) * 100);
    if (pct >= 50 && pct <= 100) return pct;
  }
  // Default realistic like ratio between 93% and 99%
  return 97;
}

export function generateRandomStats(): { views: number; likes: number; likePercentage: number } {
  // Minimum 200k (200,000) and Maximum 10 million (10,000,000)
  const minViews = 200_000;
  const maxViews = 10_000_000;
  const views = Math.floor(Math.random() * (maxViews - minViews + 1)) + minViews;

  // Realistic high-satisfaction like percentage between 92% and 99% (e.g., 97%)
  const likePercentage = Math.floor(Math.random() * (99 - 92 + 1)) + 92;
  const likes = Math.round(views * (likePercentage / 100));

  return { views, likes, likePercentage };
}
