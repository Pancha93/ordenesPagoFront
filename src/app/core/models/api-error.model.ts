/**
 * Estructura de errores de la API
 */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: { [key: string]: string };
}
