import apiClient from './api.client';
import type {
  VideoAnalysisRequest,
  VideoAnalysisResponse,
  CostEstimateRequest,
  CostEstimateResponse,
  TextGenerationRequest,
  TextGenerationResponse,
  TextWithImageRequest,
  TextWithImageResponse,
  ConversationRequest,
  ConversationResponse,
  MultipleCandidatesRequest,
  MultipleCandidatesResponse,
  TokenCountRequest,
  TokenCountResponse,
  ModelsListResponse,
  ModelCheckRequest,
  ModelCheckResponse,
} from '../types/ai-services.types';

const AI_SERVICES_BASE = '/ai-services';

export const aiServicesService = {
  // ============================================
  // VIDEO ANALYSIS ENDPOINTS
  // ============================================

  /**
   * Analyze video with AI (Gemini Vision)
   * POST /api/ai-services/video/analyze
   */
  analyzeVideo: async (data: VideoAnalysisRequest): Promise<VideoAnalysisResponse> => {
    const response = await apiClient.post(`${AI_SERVICES_BASE}/video/analyze`, data);
    return response.data;
  },

  /**
   * Get cost estimate for video analysis
   * GET /api/ai-services/video/cost-estimate
   */
  getCostEstimate: async (params: CostEstimateRequest): Promise<CostEstimateResponse> => {
    const response = await apiClient.get(`${AI_SERVICES_BASE}/video/cost-estimate`, {
      params,
    });
    return response.data;
  },

  // ============================================
  // TEXT GENERATION ENDPOINTS
  // ============================================

  /**
   * Generate text with Gemini
   * POST /api/ai-services/text/generate
   */
  generateText: async (data: TextGenerationRequest): Promise<TextGenerationResponse> => {
    const response = await apiClient.post(`${AI_SERVICES_BASE}/text/generate`, data);
    return response.data;
  },

  /**
   * Generate text with image input
   * POST /api/ai-services/text/generate-with-image
   */
  generateTextWithImage: async (data: TextWithImageRequest): Promise<TextWithImageResponse> => {
    const response = await apiClient.post(`${AI_SERVICES_BASE}/text/generate-with-image`, data);
    return response.data;
  },

  /**
   * Conversation with history
   * POST /api/ai-services/text/conversation
   */
  conversation: async (data: ConversationRequest): Promise<ConversationResponse> => {
    const response = await apiClient.post(`${AI_SERVICES_BASE}/text/conversation`, data);
    return response.data;
  },

  /**
   * Generate multiple text variations
   * POST /api/ai-services/text/multiple-candidates
   */
  generateMultipleCandidates: async (
    data: MultipleCandidatesRequest
  ): Promise<MultipleCandidatesResponse> => {
    const response = await apiClient.post(`${AI_SERVICES_BASE}/text/multiple-candidates`, data);
    return response.data;
  },

  /**
   * Count tokens in text
   * POST /api/ai-services/text/count-tokens
   */
  countTokens: async (data: TokenCountRequest): Promise<TokenCountResponse> => {
    const response = await apiClient.post(`${AI_SERVICES_BASE}/text/count-tokens`, data);
    return response.data;
  },

  // ============================================
  // MODEL INFO ENDPOINTS
  // ============================================

  /**
   * Get available AI models
   * GET /api/ai-services/models
   */
  getModels: async (): Promise<ModelsListResponse> => {
    const response = await apiClient.get(`${AI_SERVICES_BASE}/models`);
    return response.data;
  },

  /**
   * Check if specific model is available
   * GET /api/ai-services/models/check
   */
  checkModel: async (params: ModelCheckRequest): Promise<ModelCheckResponse> => {
    const response = await apiClient.get(`${AI_SERVICES_BASE}/models/check`, {
      params,
    });
    return response.data;
  },
};

export default aiServicesService;
