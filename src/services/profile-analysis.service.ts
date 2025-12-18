import apiClient from './api.client';
import type {
  ProfileScrapeRequest,
  ProfileScrapeResponse,
  FilteredDataResponse,
  FilteredVideosResponse,
  VideoAnalysisRequest,
  VideoAnalysisJobResponse,
  VideoAnalysisJobStatusResponse,
  ProfileInsightsResponse,
  ProfileAnalysisHistoryResponse,
  ProfileAnalysisStats,
} from '../types/profile-analysis.types';

const PROFILE_ANALYSIS_BASE = '/profile-analysis';

export const profileAnalysisService = {
  /**
   * 1️⃣ Paso 1: Scrapear perfil de TikTok
   * POST /api/profile-analysis/scrape
   */
  scrapeProfile: async (
    data: ProfileScrapeRequest
  ): Promise<ProfileScrapeResponse> => {
    const response = await apiClient.post(`${PROFILE_ANALYSIS_BASE}/scrape`, data);
    return response.data;
  },

  /**
   * 2️⃣ Paso 2: Filtrar datos scrapeados
   * POST /api/profile-analysis/:analysisId/filter
   */
  filterData: async (analysisId: string): Promise<FilteredDataResponse> => {
    const response = await apiClient.post(
      `${PROFILE_ANALYSIS_BASE}/${analysisId}/filter`
    );
    return response.data;
  },

  /**
   * 3️⃣ Paso 3: Obtener videos filtrados para que el usuario seleccione
   * GET /api/profile-analysis/:analysisId/filtered-videos
   */
  getFilteredVideos: async (
    analysisId: string
  ): Promise<FilteredVideosResponse> => {
    const response = await apiClient.get(
      `${PROFILE_ANALYSIS_BASE}/${analysisId}/filtered-videos`
    );
    return response.data;
  },

  /**
   * 4️⃣ Paso 4: Iniciar análisis de videos seleccionados
   * POST /api/profile-analysis/:analysisId/analyze-videos
   */
  analyzeVideos: async (
    analysisId: string,
    data: VideoAnalysisRequest
  ): Promise<VideoAnalysisJobResponse> => {
    const response = await apiClient.post(
      `${PROFILE_ANALYSIS_BASE}/${analysisId}/analyze-videos`,
      data
    );
    return response.data;
  },

  /**
   * 4.1️⃣ Paso 4.1: Ejecutar procesamiento del job (TESTING)
   * POST /api/profile-analysis/jobs/:jobId/process
   *
   * NOTA: En producción, esto debería ejecutarse automáticamente con un sistema de colas.
   * Por ahora, se ejecuta manualmente para testing.
   */
  processJob: async (jobId: string): Promise<{ success: boolean; message: string; jobId: string }> => {
    const response = await apiClient.post(
      `${PROFILE_ANALYSIS_BASE}/jobs/${jobId}/process`
    );
    return response.data;
  },

  /**
   * 5️⃣ Paso 5: Obtener estado del análisis de videos (para polling)
   * GET /api/profile-analysis/:analysisId/video-analysis-status/:jobId
   */
  getVideoAnalysisStatus: async (
    analysisId: string,
    jobId: string
  ): Promise<VideoAnalysisJobStatusResponse> => {
    const response = await apiClient.get(
      `${PROFILE_ANALYSIS_BASE}/${analysisId}/video-analysis-status/${jobId}`
    );
    return response.data;
  },

  /**
   * 6️⃣ Paso 6: Obtener insights finales
   * GET /api/profile-analysis/:analysisId/insights
   */
  getInsights: async (analysisId: string): Promise<ProfileInsightsResponse> => {
    const response = await apiClient.get(
      `${PROFILE_ANALYSIS_BASE}/${analysisId}/insights`
    );
    return response.data;
  },

  /**
   * 7️⃣ Paso 7: Regenerar insights con Gemini (sin re-analizar videos)
   * POST /api/profile-analysis/:analysisId/regenerate-insights/:jobId
   */
  regenerateInsights: async (
    analysisId: string,
    jobId: string,
    options?: {
      temperature?: number;
      enfoque?: 'creativo' | 'conservador' | 'analitico' | 'viral' | 'educativo';
      numeroIdeas?: number;
      guardarVariante?: boolean;
      nombreVariante?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    jobId: string;
    videosAnalizados: number;
    opciones: {
      enfoque: string;
      temperature: number;
      numeroIdeas: number;
      guardarVariante: boolean;
    };
  }> => {
    const response = await apiClient.post(
      `${PROFILE_ANALYSIS_BASE}/${analysisId}/regenerate-insights/${jobId}`,
      options || {}
    );
    return response.data;
  },

  /**
   * 📊 Obtener historial de análisis del usuario
   * GET /api/profile-analysis/user/history
   */
  getHistory: async (params?: {
    limit?: number;
    page?: number;
  }): Promise<ProfileAnalysisHistoryResponse> => {
    const response = await apiClient.get(`${PROFILE_ANALYSIS_BASE}/user/history`, {
      params: {
        limit: params?.limit || 20,
        page: params?.page || 1,
      },
    });
    return response.data;
  },

  /**
   * 📈 Obtener estadísticas del usuario
   * GET /api/profile-analysis/user/stats
   */
  getStats: async (): Promise<ProfileAnalysisStats> => {
    const response = await apiClient.get(`${PROFILE_ANALYSIS_BASE}/user/stats`);
    return response.data;
  },

  /**
   * 🗑️ Eliminar un análisis
   * DELETE /api/profile-analysis/:analysisId
   */
  deleteAnalysis: async (analysisId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(
      `${PROFILE_ANALYSIS_BASE}/${analysisId}`
    );
    return response.data;
  },
};

export default profileAnalysisService;
