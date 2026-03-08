/**
 * Configuración para producción (Docker)
 */
export const environment = {
  production: true,
  // En Docker, Nginx hace proxy al backend, así que usamos ruta relativa
  apiUrl: '/api'
};
