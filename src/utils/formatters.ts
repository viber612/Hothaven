export function formatViews(views: number): string {
  if (views >= 1_000_000) {
    const val = (views / 1_000_000).toFixed(1);
    return `${val.replace(/\.0$/, '')}M`;
  }
  if (views >= 1_000) {
    const val = (views / 1_000).toFixed(1);
    return `${val.replace(/\.0$/, '')}K`;
  }
  return views.toLocaleString();
}

export function formatLikes(likes: number): string {
  if (likes >= 1_000_000) {
    const val = (likes / 1_000_000).toFixed(1);
    return `${val.replace(/\.0$/, '')}M`;
  }
  if (likes >= 1_000) {
    const val = (likes / 1_000).toFixed(1);
    return `${val.replace(/\.0$/, '')}K`;
  }
  return likes.toLocaleString();
}

export function getLikePercentage(video: { views?: number; likes?: number; likePercentage?: number }): number {
  if (typeof video.likePercentage === 'number' && video.likePercentage > 0 && video.likePercentage <= 100) {
    return video.likePercentage;
  }
  if (typeof video.views === 'number' && video.views > 0 && typeof video.likes === 'number' && video.likes > 0) {
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
