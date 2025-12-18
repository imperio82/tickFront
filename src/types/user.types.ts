export const EstadoUsuario = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido',
} as const;

export type EstadoUsuario = typeof EstadoUsuario[keyof typeof EstadoUsuario];

export const TipoSuscripcion = {
  GRATUITA: 'gratuita',
  BASICA: 'basica',
  PREMIUM: 'premium',
  EMPRESARIAL: 'empresarial',
} as const;

export type TipoSuscripcion = typeof TipoSuscripcion[keyof typeof TipoSuscripcion];

export const RolUsuario = {
  USUARIO: 'usuario',
  ADMIN: 'admin',
} as const;

export type RolUsuario = typeof RolUsuario[keyof typeof RolUsuario];

export interface User {
  id: string;
  email: string;
  username: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fechaNacimiento?: string;
  empresa?: string;
  cargo?: string;
  sitioWeb?: string;
  estado: EstadoUsuario;
  emailVerificado: boolean;
  tipoSuscripcion: TipoSuscripcion;
  fechaVencimientoSuscripcion?: Date;
  limiteBusquedasMes: number;
  busquedasUtilizadasMes: number;
  limitePerfilesSeguimiento: number;
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  rol?: RolUsuario;
  // Campos del sistema de créditos
  creditosDisponibles: number;
  totalCreditosComprados: number;
  totalCreditosConsumidos: number;
  creadoEn: Date;
  actualizadoEn: Date;
  ultimoAcceso?: Date;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fechaNacimiento?: string;
  empresa?: string;
  cargo?: string;
  sitioWeb?: string;
  notificacionesEmail?: boolean;
  notificacionesPush?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  empresa?: string;
  cargo?: string;
  sitioWeb?: string;
  notificacionesEmail?: boolean;
  notificacionesPush?: boolean;
}
