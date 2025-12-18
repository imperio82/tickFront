// Calendar module types
// Following the "as const" pattern used throughout the project

// ==================== ENUMS ====================

export const PostStatus = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
} as const;

export type PostStatus = typeof PostStatus[keyof typeof PostStatus];

export const PostPlatform = {
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
} as const;

export type PostPlatform = typeof PostPlatform[keyof typeof PostPlatform];

export const CalendarStrategy = {
  OPTIMAL_HOURS: 'optimal_hours',
  COMPETITOR_PATTERN: 'competitor_pattern',
  BALANCED: 'balanced',
  CUSTOM: 'custom',
} as const;

export type CalendarStrategy = typeof CalendarStrategy[keyof typeof CalendarStrategy];

// ==================== MAIN INTERFACES ====================

export interface ScheduledPost {
  id: string;
  userId: string;
  title: string;
  description?: string;
  hashtags: string[];
  platform: PostPlatform;
  scheduledDate: Date | string;
  status: PostStatus;
  metadata?: {
    videoUrl?: string;
    coverImageUrl?: string;
    duration?: number;
    category?: string;
    targetAudience?: string;
    notes?: string;
  };
  inspirationAnalysisId?: string;
  inspirationVideoId?: string;
  sendReminder: boolean;
  reminderMinutesBefore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt?: Date | string;
}

export interface CreatePostDto {
  title: string;
  description?: string;
  hashtags: string[];
  platform: PostPlatform;
  scheduledDate: string;
  status?: PostStatus;
  metadata?: Record<string, any>;
  sendReminder?: boolean;
  reminderMinutesBefore?: number;
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

export interface OptimalHour {
  hour: number;
  dayOfWeek: number;
  averageEngagement: number;
  sampleSize: number;
  score: number;
}

export interface CalendarStatistics {
  totalPosts: number;
  distributionByDay: Record<string, number>;
  distributionByHour: Record<string, number>;
  averagePostsPerWeek: number;
  optimalHoursUsed: string[];
  upcomingPosts: number;
  publishedPosts: number;
  draftPosts: number;
}

export interface ContentCalendar {
  id: string;
  userId: string;
  name: string;
  description?: string;
  strategy: CalendarStrategy;
  configuration: any;
  statistics?: CalendarStatistics;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GenerateCalendarDto {
  calendarName: string;
  description?: string;
  startDate: string;
  endDate: string;
  postsPerWeek: number;
  strategy?: CalendarStrategy;
  preferredDays?: number[];
  preferredHours?: number[];
  referenceAnalysisId?: string;
  contentMix?: {
    educational?: number;
    entertaining?: number;
    promotional?: number;
  };
}

export interface GenerateCalendarResponse {
  calendar: ContentCalendar;
  posts: ScheduledPost[];
}

export interface BulkCreatePostsDto {
  posts: CreatePostDto[];
}

// ==================== QUERY PARAMS ====================

export interface GetPostsParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  platform?: string;
}
