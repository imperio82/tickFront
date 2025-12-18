// Tipos para Análisis de Perfil Individual

// ============================================
// ENUMS Y CONSTANTES
// ============================================

export const ProfileAnalysisStatus = {
  PENDING: 'pending',
  SCRAPING: 'scraping',
  SCRAPED: 'scraped',
  FILTERING: 'filtering',
  FILTERED: 'filtered',
  ANALYZING_VIDEOS: 'analyzing_videos',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ProfileAnalysisStatus = typeof ProfileAnalysisStatus[keyof typeof ProfileAnalysisStatus];

export const VideoAnalysisJobStatus = {
  QUEUED: 'queued',
  DOWNLOADING: 'downloading',
  ANALYZING_VIDEOS: 'analyzing_videos',
  GENERATING_INSIGHTS: 'generating_insights',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type VideoAnalysisJobStatus = typeof VideoAnalysisJobStatus[keyof typeof VideoAnalysisJobStatus];

export const AnalysisType = {
  BASIC: 'basic',
  DETAILED: 'detailed',
} as const;

export type AnalysisType = typeof AnalysisType[keyof typeof AnalysisType];

// ============================================
// REQUEST TYPES
// ============================================

export interface ProfileScrapeRequest {
  profileUrl: string;
  resultsPerPage?: number;
}

export interface VideoAnalysisRequest {
  selectedVideoIds: string[];
  analysisType?: AnalysisType;
}

// ============================================
// RESPONSE TYPES - SCRAPING
// ============================================

export interface ProfileScrapeResponse {
  analysisId: string;
  totalVideos: number;
  runId: string;
  status: ProfileAnalysisStatus;
  message: string;
}

// ============================================
// RESPONSE TYPES - FILTERED DATA
// ============================================

export interface VideoMetrics {
  engagementTotal: number;
  tasaEngagement: string;
}

export interface VideoMultimedia {
  webVideoUrl: string;
  coverUrl: string;
}

export interface AuthorData {
  nombre: string;
  username: string;
  followers?: number;
  verified?: boolean;
}

export interface FilteredVideo {
  id: string;
  texto: string;
  vistas: number;
  likes: number;
  comentarios: number;
  compartidos: number;
  hashtags: string[];
  metricas: VideoMetrics;
  multimedia: VideoMultimedia;
  autor?: AuthorData;
  createTime?: string;
  videoUrl?: string;
  thumbnail?: string;
}

export interface ContentRecommendation {
  tipo: string;
  razonamiento: string;
}

export interface HashtagStrategy {
  hashtag: string;
  frecuencia: number;
  promedioEngagement: number;
}

export interface OptimalPattern {
  horarioOptimo?: string;
  duracionOptima?: string;
  frecuenciaPublicacion?: string;
}

export interface FilteredDataInsights {
  recomendacionesContenido: ContentRecommendation[];
  estrategiaHashtags: HashtagStrategy[];
  patronesOptimos: OptimalPattern;
}

export interface FilteredDataStatistics {
  promedioVistas: number;
  promedioLikes: number;
  promedioComentarios: number;
  promedioCompartidos: number;
  totalVideos: number;
}

export interface FilteredDataResponse {
  filteredDataId: string;
  top5EngagementOptimo: FilteredVideo[];
  insights: FilteredDataInsights;
  estadisticas: FilteredDataStatistics;
}

// ============================================
// RESPONSE TYPES - VIDEO SELECTION
// ============================================

export interface FilteredVideosResponse {
  videos: FilteredVideo[];
  recomendados: string[];
  totalVideos: number;
}

// ============================================
// RESPONSE TYPES - VIDEO ANALYSIS JOB
// ============================================

export interface VideoAnalysisJobResponse {
  jobId: string;
  status: VideoAnalysisJobStatus;
  estimatedTime: number;
  videosToAnalyze: number;
  message: string;
}

export interface VideoAnalysisJobStatusResponse {
  jobId: string;
  status: VideoAnalysisJobStatus;
  progress: number;
  currentStep: string;
  videosProcessed: number;
  videosTotal: number;
  currentVideo?: string;
  error?: string;
}

// ============================================
// RESPONSE TYPES - VIDEO ANALYSIS RESULTS
// ============================================

export interface VideoLabel {
  entity: string;
  confidence: number;
  categories?: string[];
}

export interface SpeechTranscription {
  transcript: string;
  confidence: number;
  startTime: string;
  endTime: string;
}

export interface ShotChange {
  time: string;
}

export interface VideoAnalysisData {
  labels: VideoLabel[];
  speechTranscriptions?: SpeechTranscription[];
  shotChanges?: ShotChange[];
  dominantColors?: string[];
  textDetections?: string[];
}

export interface VideoAnalysisResult {
  videoId: string;
  videoData: FilteredVideo;
  videoAnalysis: VideoAnalysisData;
}

// ============================================
// RESPONSE TYPES - GEMINI INSIGHTS
// ============================================

export interface ContentIdea {
  titulo: string;
  concepto: string;
  hashtags: string[];
  razonamiento: string;
}

export interface ParsedGeminiInsights {
  resumenGeneral: string;
  patronesIdentificados: string[];
  recomendaciones: string[];
  ideasContenido: ContentIdea[];
  mejorasSugeridas?: string[];
  oportunidades?: string[];
}

export interface GeminiInsights {
  rawResponse: string;
  parsedInsights: ParsedGeminiInsights;
}

export interface ProfileInsightsResponse {
  videoAnalysis: VideoAnalysisResult[];
  geminiInsights: GeminiInsights;
  recommendations: string[];
  patterns: Record<string, any>;
  status: ProfileAnalysisStatus;
  completedAt?: string;
  jobId?: string;
}

// ============================================
// HISTORY TYPES
// ============================================

export interface ProfileAnalysisHistoryItem {
  id: string;
  profileUrl: string;
  status: ProfileAnalysisStatus;
  totalVideos: number;
  videosAnalyzed?: number;
  createdAt: string;
  completedAt?: string;
  jobId?: string;
  scrapingMetadata?: {
    totalVideosScraped: number;
    videosAnalyzedWithAI: number;
    runId?: string;
  };
}

export interface ProfileAnalysisHistoryResponse {
  analyses: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// STATS TYPES
// ============================================

export interface ProfileAnalysisStats {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
}
