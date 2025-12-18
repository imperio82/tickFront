import { apiClient } from './api.client';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user.types';
import { TipoSuscripcion } from '../types/user.types';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const userService = {
  /**
   * Create new user (register)
   */
  async create(userData: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>('/user', userData);
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/user/${id}`);
    return response.data;
  },

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User> {
    const response = await apiClient.get<User>(`/user/email/${email}`);
    return response.data;
  },

  /**
   * List users with pagination
   */
  async list(page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/user', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Update user profile
   */
  async update(id: string, userData: UpdateUserDto): Promise<User> {
    const response = await apiClient.put<User>(`/user/${id}`, userData);
    return response.data;
  },

  /**
   * Delete user account
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/user/${id}`);
  },

  /**
   * Update subscription
   */
  async updateSubscription(
    id: string,
    tipoSuscripcion: TipoSuscripcion,
    limiteBusquedasMes?: number,
    limitePerfilesSeguimiento?: number
  ): Promise<User> {
    const response = await apiClient.put<User>(`/user/${id}/suscripcion`, {
      tipoSuscripcion,
      limiteBusquedasMes,
      limitePerfilesSeguimiento,
    });
    return response.data;
  },

  /**
   * Verify user email
   */
  async verifyEmail(id: string): Promise<User> {
    const response = await apiClient.put<User>(`/user/${id}/verificar-email`);
    return response.data;
  },

  /**
   * Increment monthly searches counter
   */
  async incrementSearches(id: string): Promise<User> {
    const response = await apiClient.put<User>(`/user/${id}/incrementar-busquedas`);
    return response.data;
  },
};
