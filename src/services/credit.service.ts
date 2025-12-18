import apiClient from './api.client';
import type {
  CreditPackage,
  CreditTransaction,
  CreditBalance,
  CreditStats,
  PurchaseCreditsDto,
  ConsumeCreditsDto,
  GiftCreditsDto,
  CreatePackageDto,
  UpdatePackageDto,
  TransactionHistoryResponse,
  AdminStats,
  CreditEstimate,
} from '../types/credit.types';

const CREDITS_BASE = '/credits';

export const creditService = {
  // ==================== PAQUETES DE CRÉDITOS ====================

  /**
   * Obtener todos los paquetes de créditos disponibles
   */
  async getAllPackages(): Promise<CreditPackage[]> {
    const response = await apiClient.get(`${CREDITS_BASE}/packages`);
    return response.data;
  },

  /**
   * Inicializar paquetes de créditos (solo ejecutar una vez)
   */
  async initializePackages(): Promise<CreditPackage[]> {
    const response = await apiClient.post(`${CREDITS_BASE}/packages/initialize`);
    return response.data;
  },

  /**
   * Crear un nuevo paquete de créditos (ADMIN)
   */
  async createPackage(data: CreatePackageDto): Promise<CreditPackage> {
    const response = await apiClient.post(`${CREDITS_BASE}/packages`, data);
    return response.data;
  },

  /**
   * Actualizar un paquete existente (ADMIN)
   */
  async updatePackage(packageId: string, data: UpdatePackageDto): Promise<CreditPackage> {
    const response = await apiClient.patch(`${CREDITS_BASE}/packages/${packageId}`, data);
    return response.data;
  },

  /**
   * Eliminar un paquete (ADMIN)
   */
  async deletePackage(packageId: string): Promise<void> {
    await apiClient.delete(`${CREDITS_BASE}/packages/${packageId}`);
  },

  // ==================== COMPRA DE CRÉDITOS ====================

  /**
   * Comprar un paquete de créditos
   */
  async purchaseCredits(userId: string, data: PurchaseCreditsDto): Promise<CreditTransaction> {
    const response = await apiClient.post(`${CREDITS_BASE}/purchase/${userId}`, data);
    return response.data;
  },

  // ==================== CONSUMO DE CRÉDITOS ====================

  /**
   * Consumir créditos del usuario
   */
  async consumeCredits(userId: string, data: ConsumeCreditsDto): Promise<CreditTransaction> {
    const response = await apiClient.post(`${CREDITS_BASE}/consume/${userId}`, data);
    return response.data;
  },

  /**
   * Verificar si el usuario tiene créditos suficientes
   */
  async checkCredits(userId: string, cantidad: number): Promise<{ tieneCreditos: boolean; mensaje: string }> {
    const response = await apiClient.get(`${CREDITS_BASE}/check/${userId}/${cantidad}`);
    return response.data;
  },

  // ==================== REGALOS ====================

  /**
   * Regalar créditos a otro usuario
   */
  async giftCredits(userId: string, data: GiftCreditsDto): Promise<CreditTransaction> {
    const response = await apiClient.post(`${CREDITS_BASE}/gift/${userId}`, data);
    return response.data;
  },

  // ==================== CONSULTAS ====================

  /**
   * Obtener balance de créditos del usuario
   */
  async getBalance(userId: string): Promise<CreditBalance> {
    const response = await apiClient.get(`${CREDITS_BASE}/balance/${userId}`);
    return response.data;
  },

  /**
   * Obtener historial de transacciones paginado
   */
  async getHistory(userId: string, page = 1, limit = 10): Promise<TransactionHistoryResponse> {
    const response = await apiClient.get(`${CREDITS_BASE}/history/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Obtener estadísticas detalladas del usuario
   */
  async getStats(userId: string): Promise<CreditStats> {
    const response = await apiClient.get(`${CREDITS_BASE}/stats/${userId}`);
    return response.data;
  },

  // ==================== ADMIN ====================

  /**
   * Obtener todos los usuarios (ADMIN)
   */
  async getAllUsers(): Promise<any[]> {
    const response = await apiClient.get('/user');

    // Si el backend devuelve un objeto con paginación
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // Si el backend devuelve un array directo
    if (Array.isArray(response.data.usuarios)) {
      return response.data;
    }

    console.error('Formato inesperado de respuesta:', response.data);
    return [];
  },

  /**
   * Obtener todas las transacciones (ADMIN)
   */
  async getAllTransactions(page = 1, limit = 50): Promise<TransactionHistoryResponse> {
    const response = await apiClient.get(`${CREDITS_BASE}/transactions`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Obtener estadísticas del admin
   */
  async getAdminStats(): Promise<AdminStats> {
    const response = await apiClient.get(`${CREDITS_BASE}/admin/stats`);
    return response.data;
  },

  /**
   * Ajustar créditos de un usuario (ADMIN)
   */
  async adjustUserCredits(userId: string, cantidad: number, descripcion: string): Promise<CreditTransaction> {
    const response = await apiClient.post(`${CREDITS_BASE}/adjust/${userId}`, {
      cantidad,
      descripcion
    });
    return response.data;
  },

  // ==================== ESTIMACIÓN ====================

  /**
   * Estimar créditos necesarios para una operación
   * Fórmula: 1 crédito = 50 videos scrapeados + 4 videos analizados con IA
   */
  estimateCredits(params: {
    videosAScrappear: number;
    videosAAnalizar: number;
    creditosDisponibles: number;
  }): CreditEstimate {
    const scraping = Math.ceil(params.videosAScrappear / 50);
    const analisis = Math.ceil(params.videosAAnalizar / 4);
    const total = scraping + analisis;
    const tieneCreditos = params.creditosDisponibles >= total;
    const creditosFaltantes = tieneCreditos ? 0 : total - params.creditosDisponibles;

    return {
      scraping,
      analisis,
      total,
      tieneCreditos,
      creditosFaltantes,
    };
  },
};

export default creditService;
