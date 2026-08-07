export type VideoCategory =
  | 'All'
  | 'HD Videos'
  | 'Trending'
  | 'Amateur'
  | 'Solo'
  | 'Hardcore'
  | 'VR & 4K';

export type VideoType = 'html5' | 'embed' | 'iframe';

export interface VideoItem {
  id: string;
  title: string;
  url: string; // original input url or embed code
  embedUrl: string; // extracted embed src or direct video stream
  videoType: VideoType;
  provider?: string; // YouTube, Pornhub, XVideos, SpankBang, HTML5, Direct, etc.
  thumbnail: string;
  category: VideoCategory | string;
  duration: string; // e.g. "14:20"
  views: number;
  likes: number;
  likePercentage?: number; // e.g. 97 for 97% positive ratio
  isFeatured?: boolean;
  createdAt: string; // ISO string timestamp
}

export type SortOption = 'latest' | 'views' | 'likes' | 'featured';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
