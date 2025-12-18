import { apiClient } from './api.client';
import type {
  HashtagScrapingDto,
  ProfileScrapingDto,
  SearchScrapingDto,
  AdvancedScrapingDto,
  CommentScrapingDto,
  SoundScrapingDto,
  ScrapingResponse,
  TrendingParams,
} from '../types/tiktok.types';

interface RunStatusResponse {
  status: string;
  data?: any;
}

export const tiktokService = {
  /**
   * Scrape videos by hashtags
   */
  async scrapeByHashtags(data: HashtagScrapingDto): Promise<ScrapingResponse> {
    const response = await apiClient.post<ScrapingResponse>('/tiktok/scrape/hashtags', data);
    return response.data;
  },

  /**
   * Scrape profile videos
   */
  async scrapeProfiles(data: ProfileScrapingDto): Promise<ScrapingResponse> {
    const response = await apiClient.post<ScrapingResponse>('/tiktok/scrape/profiles', data);
    return response.data;
  },

  /**
   * Search and scrape videos
   */
  async scrapeBySearch(data: SearchScrapingDto): Promise<ScrapingResponse> {
    const response = await apiClient.post<ScrapingResponse>('/tiktok/scrape/search', data);
    return response.data;
  },

  /**
   * Scrape specific video URLs
   */
  async scrapeVideos(videoUrls: string[]): Promise<ScrapingResponse> {
    const response = await apiClient.post<ScrapingResponse>('/tiktok/scrape/videos', { videoUrls });
    return response.data;
  },

  /**
   * Advanced scraping with filters
   */
  async scrapeAdvanced(data: AdvancedScrapingDto): Promise<ScrapingResponse> {
    const response = await apiClient.post<ScrapingResponse>('/tiktok/scrape/advanced', data);
    return response.data;
  },

  /**
   * Scrape video comments
   */
  async scrapeComments(data: CommentScrapingDto): Promise<ScrapingResponse> {
    const response = await apiClient.post<ScrapingResponse>('/tiktok/scrape/comments', data);
    return response.data;
  },

  /**
   * Scrape sound/music information
   */
  async scrapeSounds(data: SoundScrapingDto): Promise<ScrapingResponse> {
    const response = await apiClient.post<ScrapingResponse>('/tiktok/scrape/sounds', data);
    return response.data;
  },

  /**
   * Get trending videos by region
   */
  async getTrending(params: TrendingParams = {}): Promise<ScrapingResponse> {
    const response = await apiClient.get<ScrapingResponse>('/tiktok/trending', { params });
    return response.data;
  },

  /**
   * Check Apify run status
   */
  async getRunStatus(runId: string): Promise<RunStatusResponse> {
    const response = await apiClient.get<RunStatusResponse>(`/tiktok/run/${runId}/status`);
    return response.data;
  },
};
