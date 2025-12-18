export const TipoPaqueteCredito = {
  GRATUITO: 'gratuito',
  BASICO: 'basico',
  ESTANDAR: 'estandar',
  PREMIUM: 'premium',
} as const;

export type TipoPaqueteCredito = typeof TipoPaqueteCredito[keyof typeof TipoPaqueteCredito];

export const TipoTransaccion = {
  COMPRA: 'compra',
  CONSUMO: 'consumo',
  REGALO: 'regalo',
  AJUSTE: 'ajuste',
} as const;

export type TipoTransaccion = typeof TipoTransaccion[keyof typeof TipoTransaccion];

export const EstadoTransaccion = {
  PENDIENTE: 'pendiente',
  COMPLETADA: 'completada',
  FALLIDA: 'fallida',
  CANCELADA: 'cancelada',
} as const;

export type EstadoTransaccion = typeof EstadoTransaccion[keyof typeof EstadoTransaccion];

export interface CreditPackage {
  id: string;
  tipo: TipoPaqueteCredito;
  nombre: string;
  creditos: number;
  precio: number;
  descripcion: string;
  activo: boolean;
  metadata?: {
    destacado?: boolean;
    etiqueta?: string;
    caracteristicas?: string[];
  };
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface CreditTransaction {
  id: string;
  usuarioId: string;
  tipo: TipoTransaccion;
  cantidad: number;
  balanceResultante: number;
  descripcion?: string;
  recursoId?: string;
  paqueteId?: string;
  pagoId?: string;
  metodoPago?: string;
  estado: EstadoTransaccion;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface CreditBalance {
  usuarioId: string;
  creditosDisponibles: number;
  totalComprados: number;
  totalConsumidos: number;
}

export interface CreditStats {
  usuarioId: string;
  creditosDisponibles: number;
  totalComprados: number;
  totalConsumidos: number;
  ultimaCompra?: Date;
  ultimoConsumo?: Date;
  totalTransacciones: number;
}

export interface PurchaseCreditsDto {
  tipoPaquete: TipoPaqueteCredito;
  pagoId: string;
  metodoPago: string;
}

export interface ConsumeCreditsDto {
  cantidad: number;
  descripcion?: string;
  recursoId?: string;
}

export interface GiftCreditsDto {
  usuarioDestinoId: string;
  cantidad: number;
  mensaje?: string;
}

export interface CreatePackageDto {
  tipo: TipoPaqueteCredito;
  nombre: string;
  creditos: number;
  precio: number;
  descripcion: string;
  activo?: boolean;
  metadata?: {
    destacado?: boolean;
    etiqueta?: string;
    caracteristicas?: string[];
  };
}

export interface UpdatePackageDto {
  nombre?: string;
  creditos?: number;
  precio?: number;
  descripcion?: string;
  activo?: boolean;
  metadata?: {
    destacado?: boolean;
    etiqueta?: string;
    caracteristicas?: string[];
  };
}

export interface TransactionHistoryResponse {
  transacciones: CreditTransaction[];
  total: number;
  pagina: number;
  limite: number;
}

export interface AdminStats {
  totalUsuarios: number;
  totalCreditosVendidos: number;
  totalCreditosConsumidos: number;
  totalIngresos: number;
  transaccionesHoy: number;
  paqueteMasPopular?: {
    nombre: string;
    ventas: number;
  };
  usuariosMasActivos: {
    usuarioId: string;
    username: string;
    analisis: number;
  }[];
}

// ============================================
// CREDIT ESTIMATION
// ============================================

export interface CreditEstimate {
  scraping: number;
  analisis: number;
  total: number;
  tieneCreditos: boolean;
  creditosFaltantes: number;
}

export interface InsufficientCreditsError {
  statusCode: 402;
  message: string;
  error: 'Insufficient Credits';
  creditosDisponibles: number;
  creditosNecesarios: number;
  desglose?: {
    scraping: number;
    analisis: number;
    videosAScrappear?: number;
    videosAAnalizar?: number;
  };
  action: 'buy_credits';
}
