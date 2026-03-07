# Frontend - Sistema de Órdenes de Pago

Frontend desarrollado en Angular 18 para el sistema de gestión de órdenes de pago.

## 🚀 Tecnologías

- Angular 18
- TypeScript
- SCSS
- RxJS
- Angular Router
- Standalone Components

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (v18 o superior)

## 🔧 Instalación

1. Navegar a la carpeta del frontend:
```bash
cd Frontend/ordenesPagoFront
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar la URL del backend:
   - Editar el archivo `src/app/core/config/environment.ts`
   - Modificar `apiUrl` si el backend no está en `http://localhost:8080/api`

## ▶️ Ejecución

### Modo Desarrollo
```bash
npm start
```
o
```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### Build de Producción
```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`

## 👥 Usuarios de Prueba

### Administrador
- **Email:** admin@vortexbird.com
- **Password:** password123
- **Permisos:** Ver todas las órdenes, aprobar, rechazar

### Operador
- **Email:** operator@vortexbird.com
- **Password:** password123
- **Permisos:** Crear órdenes, subir facturas, ver órdenes propias

## 📁 Estructura del Proyecto

```
src/app/
├── core/                      # Módulo core (servicios, guards, interceptores, modelos)
│   ├── config/               # Configuración (environment)
│   ├── guards/               # Guards de autenticación y roles
│   ├── interceptors/         # Interceptor HTTP para JWT
│   ├── models/               # Interfaces y modelos TypeScript
│   └── services/             # Servicios (auth, orders, invoices)
│
├── features/                  # Módulos de funcionalidades
│   ├── auth/                 # Autenticación (login)
│   ├── dashboard/            # Dashboard con menú lateral
│   └── orders/               # Gestión de órdenes
│       ├── order-list/       # Listado con filtros y paginación
│       ├── create-order/     # Crear nueva orden
│       └── order-detail/     # Detalle, subir factura, aprobar/rechazar
│
├── app.component.*           # Componente raíz
├── app.config.ts             # Configuración de la aplicación
└── app.routes.ts             # Definición de rutas
```

## 🔐 Autenticación y Seguridad

- **JWT:** Token almacenado en localStorage
- **Interceptor HTTP:** Agrega automáticamente el token a las peticiones
- **Guards:**
  - `authGuard`: Protege rutas que requieren autenticación
  - `adminGuard`: Protege rutas solo para administradores
  - `operatorGuard`: Protege rutas solo para operadores

## 📱 Funcionalidades Implementadas

### Login
- Formulario de autenticación con validaciones
- Redirección según rol
- Manejo de errores

### Dashboard
- Layout con menú lateral dinámico según rol
- Información del usuario autenticado
- Opción de cerrar sesión

### Órdenes (Rol: ADMIN y OPERATOR)
- Listado de órdenes con:
  - Filtrado por estado
  - Paginación
  - Ordenamiento por columnas
  - Vista responsive
- Ver detalle de orden
- Visualizar/descargar facturas

### Crear Orden (Rol: OPERATOR)
- Formulario con validaciones
- Campos: descripción y monto
- Redirección automática al detalle

### Subir Factura (Rol: OPERATOR)
- Upload de archivos PDF o imágenes (JPG, PNG)
- Validación de tipo y tamaño (máx 5MB)
- Vista previa de factura subida

### Aprobar/Rechazar Orden (Rol: ADMIN)
- Botones habilitados solo en órdenes pendientes
- Modal para ingresar motivo de rechazo
- Actualización inmediata del estado

## 🎨 Diseño

- Interfaz moderna con gradientes y sombras
- Responsive design (tablet y móvil)
- Temas de color según el estado:
  - Pendiente: Amarillo
  - Aprobada: Verde
  - Rechazada: Rojo
- Animaciones suaves en botones y tarjetas

## 🔄 Integración con Backend

El frontend consume los siguientes endpoints:

- `POST /api/auth/login` - Autenticación
- `GET /api/orders` - Listar órdenes con filtros y paginación
- `POST /api/orders` - Crear nueva orden
- `GET /api/orders/{id}` - Obtener detalle
- `PATCH /api/orders/{id}/approve` - Aprobar orden
- `PATCH /api/orders/{id}/reject` - Rechazar orden
- `POST /api/invoices/upload/{orderId}` - Subir factura
- `GET /api/invoices/order/{orderId}` - Obtener factura

## ⚠️ Notas Importantes

1. **CORS:** Asegurar que el backend permita peticiones desde `http://localhost:4200`
2. **JWT:** El token se almacena en localStorage (considerar seguridad en producción)
3. **Sesión:** No hay renovación automática de token, la sesión expira según configuración del backend
4. **Archivos:** Las facturas se abren en nueva pestaña para visualización/descarga

## 🐛 Troubleshooting

### Error de conexión al backend
- Verificar que el backend esté ejecutándose
- Revisar la URL en `src/app/core/config/environment.ts`
- Verificar configuración CORS en el backend

### Error 401 (Unauthorized)
- Verificar que las credenciales sean correctas
- El token puede haber expirado (hacer logout y login nuevamente)

### Problemas con archivos
- Verificar que el tipo de archivo sea PDF, JPG o PNG
- Tamaño máximo: 5MB
- Verificar permisos de escritura en el backend

## 📝 Decisiones Técnicas

1. **Standalone Components:** Se optó por usar standalone components en lugar de NgModules para simplificar la estructura y aprovechar las últimas features de Angular 18.

2. **Functional Guards:** Se implementaron guards funcionales en lugar de class-based guards, siguiendo las mejores prácticas actuales de Angular.

3. **Interceptor Funcional:** El interceptor HTTP usa el nuevo formato funcional de Angular.

4. **Reactive Forms:** Se utilizó Reactive Forms para mayor control y validación de formularios.

5. **Separación de Responsabilidades:** Estructura clara con carpetas `core` (servicios compartidos) y `features` (componentes por funcionalidad).

## 🚧 Funcionalidades Pendientes / Mejoras Futuras

- [ ] Renovación automática de token JWT
- [ ] Caché de peticiones HTTP
- [ ] Lazy loading de módulos
- [ ] Tests unitarios y e2e
- [ ] Internacionalización (i18n)
- [ ] Modo oscuro
- [ ] Notificaciones push
- [ ] Exportación de órdenes a Excel/PDF
- [ ] Gráficos y estadísticas
- [ ] Búsqueda avanzada con más filtros

## 📞 Soporte

Para cualquier duda o problema, contactar al equipo de desarrollo.