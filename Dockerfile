# ==========================================
# Multi-stage build para optimizar imagen
# ==========================================

# ==========================================
# STAGE 1: Build
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias primero (para cache de Docker)
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir aplicación para producción
RUN npm run build -- --configuration production

# ==========================================
# STAGE 2: Runtime con Nginx
# ==========================================
FROM nginx:1.25-alpine

# Copiar archivos compilados desde stage de build
COPY --from=build /app/dist/front/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Nginx se ejecuta automáticamente
CMD ["nginx", "-g", "daemon off;"]
