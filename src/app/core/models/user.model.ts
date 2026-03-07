/**
 * Enumeración de roles de usuario en el sistema.
 * ADMIN: Puede aprobar/rechazar órdenes y ver todas las órdenes
 * OPERATOR: Puede crear órdenes y subir facturas
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

/**
 * Interfaz para la solicitud de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interfaz para la respuesta de autenticación con JWT
 */
export interface AuthResponse {
  token: string;
  tokenType: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresIn: number;
}

/**
 * Interfaz para los datos del usuario autenticado almacenados en el sistema
 */
export interface CurrentUser {
  email: string;
  fullName: string;
  role: UserRole;
  token: string;
}
