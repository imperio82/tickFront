import { apiClient } from './api.client';
import type { Analysis, CreateAnalysisDto, AnalysisStats } from '../types/analysis.types';
import { AnalysisStatus, QueryType } from '../types/analysis.types';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface ListAnalysisParams {
  page?: number;
  limit?: number;
  userId?: string;
  queryType?: QueryType;
  status?: AnalysisStatus;
}

export const analysisService = {
  /**
   * Create new analysis
   */
  async create(data: CreateAnalysisDto): Promise<Analysis> {
    const response = await apiClient.post<Analysis>('/analysis', data);
    return response.data;
  },

  /**
   * List analyses with filters and pagination
   */
  async list(params: ListAnalysisParams = {}): Promise<PaginatedResponse<Analysis>> {
    const response = await apiClient.get<PaginatedResponse<Analysis>>('/analysis', { params });
    return response.data;
  },

  /**
   * Get analysis by ID
   */
  async getById(id: string): Promise<Analysis> {
    const response = await apiClient.get<Analysis>(`/analysis/${id}`);
    return response.data;
  },

  /**
   * Get user's analyses
   */
  async getByUser(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Analysis>> {
    const response = await apiClient.get<PaginatedResponse<Analysis>>(`/analysis/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Update analysis
   */
  async update(id: string, data: Partial<CreateAnalysisDto>): Promise<Analysis> {
    const response = await apiClient.patch<Analysis>(`/analysis/${id}`, data);
    return response.data;
  },

  /**
   * Delete analysis
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/analysis/${id}`);
  },

  /**
   * Get analysis statistics
   */
  async getStats(): Promise<AnalysisStats> {
    const response = await apiClient.get<AnalysisStats>('/analysis/stats');
    return response.data;
  },

  /**
   * Search in analysis results
   */
  async search(query: string, params?: ListAnalysisParams): Promise<PaginatedResponse<Analysis>> {
    const response = await apiClient.get<PaginatedResponse<Analysis>>('/analysis/search', {
      params: { query, ...params },
    });
    return response.data;
  },

  /**
   * Get duplicate analyses
   */
  async getDuplicates(): Promise<Analysis[]> {
    const response = await apiClient.get<Analysis[]>('/analysis/duplicates');
    return response.data;
  },

  /**
   * Get analyses by query type
   */
  async getByQueryType(type: QueryType, params?: ListAnalysisParams): Promise<PaginatedResponse<Analysis>> {
    const response = await apiClient.get<PaginatedResponse<Analysis>>(`/analysis/by-query-type/${type}`, {
      params,
    });
    return response.data;
  },

  /**
   * Get analyses by date range
   */
  async getByDateRange(startDate: string, endDate: string, params?: ListAnalysisParams): Promise<PaginatedResponse<Analysis>> {
    const response = await apiClient.get<PaginatedResponse<Analysis>>('/analysis/date-range', {
      params: { startDate, endDate, ...params },
    });
    return response.data;
  },

  /**
   * Update analysis status
   */
  async updateStatus(id: string, status: AnalysisStatus): Promise<Analysis> {
    const response = await apiClient.patch<Analysis>(`/analysis/${id}/status`, { status });
    return response.data;
  },

  /**
   * Update analysis result
   */
  async updateResult(id: string, analysisResult: any): Promise<Analysis> {
    const response = await apiClient.patch<Analysis>(`/analysis/${id}/result`, { analysisResult });
    return response.data;
  },

  /**
   * Delete multiple analyses
   */
  async deleteMultiple(ids: string[]): Promise<void> {
    await apiClient.delete('/analysis/bulk/multiple', { data: { ids } });
  },
};
