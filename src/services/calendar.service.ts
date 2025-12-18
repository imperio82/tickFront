import apiClient from './api.client';
import type {
  ScheduledPost,
  CreatePostDto,
  UpdatePostDto,
  OptimalHour,
  CalendarStatistics,
  ContentCalendar,
  GenerateCalendarDto,
  GenerateCalendarResponse,
  BulkCreatePostsDto,
  GetPostsParams,
} from '../types/calendar.types';

const CALENDAR_BASE = '/calendar';

export const calendarService = {
  // ==================== POSTS ====================

  /**
   * Create a single scheduled post
   */
  async createPost(data: CreatePostDto): Promise<ScheduledPost> {
    const response = await apiClient.post<ScheduledPost>(`${CALENDAR_BASE}/posts`, data);
    return response.data;
  },

  /**
   * Get all posts with optional filters
   */
  async getPosts(params?: GetPostsParams): Promise<ScheduledPost[]> {
    const response = await apiClient.get<ScheduledPost[]>(`${CALENDAR_BASE}/posts`, { params });
    return response.data;
  },

  /**
   * Get upcoming posts for next N days
   */
  async getUpcomingPosts(days: number = 7): Promise<ScheduledPost[]> {
    const response = await apiClient.get<ScheduledPost[]>(`${CALENDAR_BASE}/posts/upcoming`, {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get post by ID
   */
  async getPostById(id: string): Promise<ScheduledPost> {
    const response = await apiClient.get<ScheduledPost>(`${CALENDAR_BASE}/posts/${id}`);
    return response.data;
  },

  /**
   * Update a post
   */
  async updatePost(id: string, data: UpdatePostDto): Promise<ScheduledPost> {
    const response = await apiClient.put<ScheduledPost>(`${CALENDAR_BASE}/posts/${id}`, data);
    return response.data;
  },

  /**
   * Delete a post
   */
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${CALENDAR_BASE}/posts/${id}`);
    return response.data;
  },

  /**
   * Create multiple posts at once
   */
  async createBulkPosts(data: BulkCreatePostsDto): Promise<ScheduledPost[]> {
    const response = await apiClient.post<ScheduledPost[]>(`${CALENDAR_BASE}/posts/bulk`, data);
    return response.data;
  },

  // ==================== OPTIMAL HOURS ====================

  /**
   * Get optimal posting hours based on analysis
   */
  async getOptimalHours(topHours: number = 10, analysisId?: string): Promise<OptimalHour[]> {
    const response = await apiClient.get<OptimalHour[]>(`${CALENDAR_BASE}/optimal-hours`, {
      params: { topHours, analysisId },
    });
    return response.data;
  },

  // ==================== CALENDAR GENERATION ====================

  /**
   * Generate a complete calendar automatically
   */
  async generateCalendar(data: GenerateCalendarDto): Promise<GenerateCalendarResponse> {
    const response = await apiClient.post<GenerateCalendarResponse>(`${CALENDAR_BASE}/generate`, data);
    return response.data;
  },

  /**
   * List all generated calendars
   */
  async getCalendars(): Promise<ContentCalendar[]> {
    const response = await apiClient.get<ContentCalendar[]>(`${CALENDAR_BASE}/calendars`);
    return response.data;
  },

  /**
   * Get calendar by ID
   */
  async getCalendarById(id: string): Promise<ContentCalendar> {
    const response = await apiClient.get<ContentCalendar>(`${CALENDAR_BASE}/calendars/${id}`);
    return response.data;
  },

  /**
   * Delete a calendar
   */
  async deleteCalendar(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${CALENDAR_BASE}/calendars/${id}`);
    return response.data;
  },

  // ==================== STATISTICS ====================

  /**
   * Get calendar statistics
   */
  async getStatistics(startDate?: string, endDate?: string): Promise<CalendarStatistics> {
    const response = await apiClient.get<CalendarStatistics>(`${CALENDAR_BASE}/statistics`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

export default calendarService;
