export type ScrapingType = 'HASHTAG' | 'PROFILE' | 'SEARCH' | 'VIDEO' | 'TREND' | 'MUSIC';

export interface HashtagScrapingDto {
  hashtags: string[];
  resultsPerPage?: number;
  shouldDownloadCovers?: boolean;
  shouldDownloadVideos?: boolean;
  shouldDownloadSubtitles?: boolean;
  shouldDownloadSlideshowImages?: boolean;
  numberOfVideos: number;
  proxyConfiguration?: {
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[];
    apifyProxyCountry?: string;
  };
}

export interface ProfileScrapingDto {
  profiles: string[];
  resultsPerPage?: number;
  shouldDownloadCovers?: boolean;
  shouldDownloadVideos?: boolean;
  shouldDownloadSubtitles?: boolean;
  shouldDownloadSlideshowImages?: boolean;
  numberOfVideos: number;
  proxyConfiguration?: {
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[];
    apifyProxyCountry?: string;
  };
}

export interface SearchScrapingDto {
  search: string;
  resultsPerPage?: number;
  shouldDownloadCovers?: boolean;
  shouldDownloadVideos?: boolean;
  shouldDownloadSubtitles?: boolean;
  shouldDownloadSlideshowImages?: boolean;
  numberOfVideos: number;
  proxyConfiguration?: {
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[];
    apifyProxyCountry?: string;
  };
}

export interface AdvancedScrapingDto {
  type: ScrapingType;
  hashtags?: string[];
  profiles?: string[];
  search?: string;
  videoUrls?: string[];
  musicUrls?: string[];
  resultsPerPage?: number;
  maxResults?: number;
  region?: string;
  language?: string;
  shouldDownloadCovers?: boolean;
  shouldDownloadVideos?: boolean;
  shouldDownloadSubtitles?: boolean;
  shouldDownloadSlideshowImages?: boolean;
  minLikes?: number;
  maxLikes?: number;
  minComments?: number;
  maxComments?: number;
  minShares?: number;
  maxShares?: number;
  minViews?: number;
  maxViews?: number;
  createdAfter?: string;
  createdBefore?: string;
  includeVideoDetails?: boolean;
}

export interface CommentScrapingDto {
  videoUrls: string[];
  maxComments?: number;
}

export interface SoundScrapingDto {
  soundUrls: string[];
}

export interface ScrapingResponse {
  success: boolean;
  data?: any[];
  error?: string;
  runId?: string;
  totalResults?: number;
}

export interface TrendingParams {
  region?: string;
  maxResults?: number;
}
