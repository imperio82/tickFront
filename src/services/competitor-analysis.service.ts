import apiClient from './api.client';
import type {
  CompetitorAnalysisRequest,
  CompetitorAnalysisResponse,
  CategoryAnalysisRequest,
  TrendingAnalysisRequest,
  ComparativeAnalysisRequest,
  AnalysisHistoryResponse,
  AnalysisHistoryParams,
  DetailedAnalysisResponse,
} from '../types/competitor-analysis.types';

const COMPETITOR_ANALYSIS_BASE = '/competitor-analysis';

export const competitorAnalysisService = {
  /**
   * 1️⃣ Analizar perfiles de competidores
   * POST /api/competitor-analysis/competitors
   */
  analyzeCompetitors: async (
    data: CompetitorAnalysisRequest
  ): Promise<CompetitorAnalysisResponse> => {
    const response = await apiClient.post(
      `${COMPETITOR_ANALYSIS_BASE}/competitors`,
      data
    );
    return response.data;
  },

  /**
   * 2️⃣ Analizar categoría o hashtags
   * POST /api/competitor-analysis/category
   */
  analyzeCategory: async (
    data: CategoryAnalysisRequest
  ): Promise<CompetitorAnalysisResponse> => {
    const response = await apiClient.post(
      `${COMPETITOR_ANALYSIS_BASE}/category`,
      data
    );
    return response.data;
  },

  /**
   * 3️⃣ Analizar videos trending por región
   * POST /api/competitor-analysis/trending
   */
  analyzeTrending: async (
    data: TrendingAnalysisRequest
  ): Promise<CompetitorAnalysisResponse> => {
    const response = await apiClient.post(
      `${COMPETITOR_ANALYSIS_BASE}/trending`,
      data
    );
    return response.data;
  },

  /**
   * 4️⃣ Análisis comparativo: tu perfil vs competencia
   * POST /api/competitor-analysis/comparative
   */
  analyzeComparative: async (
    data: ComparativeAnalysisRequest
  ): Promise<CompetitorAnalysisResponse> => {
    const response = await apiClient.post(
      `${COMPETITOR_ANALYSIS_BASE}/comparative`,
      data
    );
    return response.data;
  },

  /**
   * 5️⃣ Obtener historial de análisis
   * GET /api/competitor-analysis/history
   */
  getHistory: async (
    params?: AnalysisHistoryParams
  ): Promise<AnalysisHistoryResponse> => {
    const response = await apiClient.get(`${COMPETITOR_ANALYSIS_BASE}/history`, {
      params: {
        type: params?.type,
        page: params?.page || 1,
        limit: params?.limit || 10,
      },
    });
    return response.data;
  },

  /**
   * 6️⃣ Obtener análisis específico con todos los detalles
   * GET /api/competitor-analysis/:id
   */
  getById: async (id: string): Promise<DetailedAnalysisResponse> => {
    const response = await apiClient.get(`${COMPETITOR_ANALYSIS_BASE}/${id}`);
    return response.data;
  },
};

export default competitorAnalysisService;
