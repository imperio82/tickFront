// Tipos para Análisis de Competencia

export const AnalysisType = {
  COMPETITOR_PROFILE: 'competitor_profile',
  CATEGORY: 'category',
  TRENDING: 'trending',
  COMPARATIVE: 'comparative',
} as const;

export type AnalysisType = typeof AnalysisType[keyof typeof AnalysisType];

export const EstimatedEngagement = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type EstimatedEngagement = typeof EstimatedEngagement[keyof typeof EstimatedEngagement];

// ============================================
// REQUEST TYPES
// ============================================

export interface CompetitorAnalysisFilters {
  minViews?: number;
  minEngagementRate?: number;
  maxDuration?: number;
  minDuration?: number;
}

export interface CompetitorAnalysisRequest {
  competitorProfiles: string[];
  videosPerProfile?: number;
  analyzeTop?: number;
  filters?: CompetitorAnalysisFilters;
}

export interface CategoryAnalysisRequest {
  hashtags?: string[];
  keywords?: string[];
  numberOfVideos?: number;
  analyzeTop?: number;
  region?: string;
  filters?: CompetitorAnalysisFilters;
}

export interface TrendingAnalysisRequest {
  region: string;
  numberOfVideos?: number;
  analyzeTop?: number;
}

export interface ComparativeAnalysisRequest {
  yourProfile: string;
  competitorProfiles: string[];
  videosPerProfile?: number;
}

// ============================================
// RESPONSE TYPES - INSIGHTS
// ============================================

export interface TopProfile {
  username: string;
  avgEngagement: number;
  totalVideos: number;
  topTopic: string;
}

export interface TopTopic {
  topic: string;
  frequency: number;
  avgEngagement: number;
}

export interface TopHashtag {
  hashtag: string;
  usage: number;
  avgViews: number;
  avgEngagement: number;
}

export interface DurationAnalysis {
  optimal: {
    min: number;
    max: number;
    median: number;
  };
  avgDuration: number;
}

export interface Insights {
  topProfiles?: TopProfile[];
  topTopics: TopTopic[];
  topHashtags: TopHashtag[];
  durationAnalysis: DurationAnalysis;
  bestPractices: string[];
  trendingPatterns: string[];
  topCreators?: TopProfile[]; // Para análisis de categoría
  viralPatterns?: string[]; // Para análisis trending
  emergingTrends?: string[]; // Para análisis trending
}

// ============================================
// RESPONSE TYPES - SUGGESTIONS
// ============================================

export interface ContentSuggestion {
  title: string;
  description: string;
  suggestedHashtags: string[];
  targetAudience: string;
  estimatedEngagement: EstimatedEngagement;
  reasoning: string;
  inspirationFrom?: string;
}

// ============================================
// RESPONSE TYPES - COMPARATIVE
// ============================================

export interface ProfileComparison {
  avgEngagement: number;
  topTopics: string[];
  strengths?: string[];
  opportunities?: string[];
}

export interface ComparativeComparison {
  yourProfile: ProfileComparison;
  competitors: ProfileComparison;
  recommendations: string[];
}

// ============================================
// MAIN RESPONSE TYPES
// ============================================

export interface AnalysisSummary {
  competitorsAnalyzed?: number;
  totalVideos: number;
  analyzedVideos: number;
  processingTime: number;
}

export interface CompetitorAnalysisResponse {
  success: boolean;
  analysisId: string;
  summary: AnalysisSummary;
  insights: Insights;
  suggestions: ContentSuggestion[];
  comparison?: ComparativeComparison; // Solo para análisis comparativo
}

// ============================================
// HISTORY TYPES
// ============================================

export interface ScrapingMetadata {
  totalVideosScraped: number;
  videosAnalyzedWithAI: number;
}

export interface AnalysisHistoryItem {
  id: string;
  analysisType: AnalysisType;
  status: 'pending' | 'completed' | 'failed';
  parameters: Record<string, any>;
  scrapingMetadata?: ScrapingMetadata;
  createdAt: string;
  completedAt?: string;
  summary?: AnalysisSummary;
}

export interface AnalysisHistoryResponse {
  data: AnalysisHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalysisHistoryParams {
  type?: AnalysisType;
  page?: number;
  limit?: number;
}

// ============================================
// DETAILED ANALYSIS RESPONSE
// ============================================

export interface DetailedAnalysisResponse extends CompetitorAnalysisResponse {
  videos?: any[]; // Videos scrapeados
  parameters: Record<string, any>;
  createdAt: string;
  completedAt: string;
}
