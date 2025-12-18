# Módulo de Administración - Sistema de Créditos

## Descripción General

Se ha implementado un módulo completo de administración para gestionar el sistema de créditos de la plataforma. Este módulo permite a los administradores gestionar usuarios, paquetes de créditos, transacciones y estadísticas del sistema.

## Estructura de Archivos

```
src/
├── components/
│   └── AdminRoute.tsx                          # Protección de rutas de admin
├── types/
│   ├── credit.types.ts                         # Tipos para el sistema de créditos
│   └── user.types.ts                           # Tipos de usuario actualizados
├── services/
│   └── credit.service.ts                       # Servicio API para créditos
├── modules/
│   ├── admin/
│   │   ├── AdminDashboard.tsx                  # Dashboard principal de admin
│   │   ├── UserManagement.tsx                  # Gestión de usuarios
│   │   ├── PackageManagement.tsx               # Gestión de paquetes
│   │   ├── TransactionHistory.tsx              # Historial de transacciones
│   │   └── UserHistory.tsx                     # Historial de usuario individual
│   └── credits/
│       └── UserCredits.tsx                     # Vista de créditos para usuarios
└── App.tsx                                      # Rutas actualizadas
```

## Rutas Disponibles

### Rutas de Administración (Requieren rol 'admin')

- `/admin` - Dashboard principal con estadísticas
- `/admin/users` - Gestión de usuarios
- `/admin/users/:userId/history` - Historial de créditos de un usuario
- `/admin/packages` - Gestión de paquetes de créditos
- `/admin/transactions` - Historial de todas las transacciones

### Rutas de Usuario Regular

- `/credits` - Ver y comprar créditos

## Funcionalidades Implementadas

### 1. Dashboard de Administración (`/admin`)

- Estadísticas generales del sistema:
  - Total de usuarios
  - Total de créditos vendidos
  - Total de créditos consumidos
  - Ingresos totales
- Paquete más popular
- Usuarios más activos
- Accesos rápidos a módulos de gestión

### 2. Gestión de Usuarios (`/admin/users`)

- Lista completa de usuarios con:
  - Información de usuario (username, email, nombre)
  - Créditos disponibles
  - Total de créditos comprados
  - Total de créditos consumidos
  - Estado del usuario
- Búsqueda por username, email o nombre
- Opción para regalar créditos a usuarios
- Ver historial de transacciones de cada usuario

### 3. Gestión de Paquetes (`/admin/packages`)

- Ver todos los paquetes de créditos
- Crear nuevos paquetes
- Editar paquetes existentes
- Activar/desactivar paquetes
- Eliminar paquetes
- Inicializar paquetes predeterminados
- Campos configurables:
  - Tipo de paquete
  - Nombre
  - Cantidad de créditos
  - Precio
  - Descripción
  - Etiqueta (ej: "Más Popular")
  - Destacado (ring visual)
  - Características (lista de features)

### 4. Historial de Transacciones (`/admin/transactions`)

- Ver todas las transacciones del sistema
- Filtros por tipo:
  - Todas
  - Compras
  - Consumos
  - Regalos
- Paginación
- Resumen de estadísticas:
  - Total de compras
  - Total de consumos
  - Total de regalos
  - Total de transacciones

### 5. Historial de Usuario (`/admin/users/:userId/history`)

- Estadísticas del usuario:
  - Créditos disponibles
  - Total comprados
  - Total consumidos
  - Total de transacciones
- Historial completo de transacciones del usuario
- Paginación

### 6. Vista de Créditos para Usuarios (`/credits`)

- Balance actual de créditos con diseño atractivo
- Total de créditos comprados y consumidos
- Catálogo de paquetes disponibles
- Compra de paquetes (integración con pasarela de pago pendiente)
- Historial reciente de transacciones

## Configuración del Sistema

### Roles de Usuario

El sistema utiliza el campo `rol` en el tipo `User`:

```typescript
export const RolUsuario = {
  USUARIO: 'usuario',
  ADMIN: 'admin',
} as const;
```

Para que un usuario acceda al módulo de admin, debe tener `rol: 'admin'` en su perfil.

### Protección de Rutas

El componente `AdminRoute` verifica:
1. Que el usuario esté autenticado
2. Que el usuario tenga rol de 'admin'
3. Si no cumple, redirige al dashboard normal

## Integración con Backend

El servicio `credit.service.ts` se conecta con los siguientes endpoints:

### Paquetes
- `GET /credits/packages` - Obtener todos los paquetes
- `POST /credits/packages/initialize` - Inicializar paquetes predeterminados
- `POST /credits/packages` - Crear paquete
- `PATCH /credits/packages/:id` - Actualizar paquete
- `DELETE /credits/packages/:id` - Eliminar paquete

### Transacciones
- `POST /credits/purchase/:userId` - Comprar créditos
- `POST /credits/consume/:userId` - Consumir créditos
- `POST /credits/gift/:userId` - Regalar créditos
- `GET /credits/check/:userId/:cantidad` - Verificar créditos

### Consultas
- `GET /credits/balance/:userId` - Obtener balance
- `GET /credits/history/:userId` - Obtener historial
- `GET /credits/stats/:userId` - Obtener estadísticas
- `GET /credits/transactions` - Obtener todas las transacciones (admin)
- `GET /credits/admin/stats` - Obtener estadísticas del sistema (admin)

## Uso del Sistema

### Para Administradores

1. **Inicializar el sistema**:
   - Ir a `/admin/packages`
   - Hacer clic en "Inicializar Paquetes" para crear los paquetes predeterminados

2. **Gestionar usuarios**:
   - Ir a `/admin/users`
   - Buscar usuarios
   - Regalar créditos si es necesario
   - Ver historial de transacciones

3. **Gestionar paquetes**:
   - Ir a `/admin/packages`
   - Crear, editar o desactivar paquetes según sea necesario

4. **Monitorear transacciones**:
   - Ir a `/admin/transactions`
   - Filtrar por tipo de transacción
   - Revisar actividad del sistema

### Para Usuarios Regulares

1. **Ver créditos disponibles**:
   - Ir a `/credits`
   - Ver balance actual y historial

2. **Comprar créditos**:
   - Ir a `/credits`
   - Seleccionar un paquete
   - Hacer clic en "Comprar Ahora"
   - Completar el pago (integración pendiente)

## Integración con Pasarela de Pago

Actualmente, el botón "Comprar Ahora" muestra un alert de ejemplo. Para integrar una pasarela de pago real:

### Opción 1: Stripe

```typescript
// En UserCredits.tsx, reemplazar confirmPurchase:
const confirmPurchase = async () => {
  if (!selectedPackage || !user) return;

  try {
    // 1. Crear sesión de pago en el backend
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        packageId: selectedPackage.id,
        tipoPaquete: selectedPackage.tipo
      })
    });

    const { sessionId } = await response.json();

    // 2. Redirigir a Stripe Checkout
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
    await stripe.redirectToCheckout({ sessionId });

  } catch (err) {
    alert('Error al procesar el pago');
  }
};
```

### Opción 2: PayPal

Similar a Stripe, crear un botón de PayPal y procesar el pago.

## Próximas Mejoras

- [ ] Integración completa con pasarela de pago
- [ ] Notificaciones cuando se queden sin créditos
- [ ] Sistema de cupones y descuentos
- [ ] Programa de referidos
- [ ] Exportar reportes en CSV/PDF
- [ ] Gráficos de estadísticas con charts
- [ ] Filtros avanzados en transacciones
- [ ] Búsqueda avanzada de usuarios

## Notas Importantes

1. **Seguridad**: Las rutas de admin están protegidas con `AdminRoute`, que verifica el rol del usuario.

2. **Tipos de TypeScript**: Todos los tipos están definidos en `src/types/credit.types.ts` y son consistentes con el backend.

3. **Estados de Usuario**: El campo `rol` debe ser configurado manualmente en la base de datos o a través de un endpoint de admin para asignar el rol 'admin' a usuarios específicos.

4. **Créditos Gratuitos**: Los usuarios nuevos reciben 3 créditos gratuitos automáticamente al registrarse (esto se maneja en el backend).

5. **Paquete Gratuito**: Solo se puede usar una vez por usuario (validación en el backend).

## Problemas Comunes

### No puedo acceder a /admin
- Verificar que el usuario tenga `rol: 'admin'` en la base de datos
- Verificar que el AuthContext esté exponiendo el campo `user.rol`

### Los paquetes no aparecen
- Ejecutar "Inicializar Paquetes" en `/admin/packages`
- Verificar que el endpoint `/credits/packages` esté funcionando

### Error al regalar créditos
- Verificar que el endpoint `/credits/gift/:userId` esté implementado en el backend
- Verificar permisos del usuario admin

## Contacto

Para preguntas o problemas con el módulo de administración, revisar la documentación del backend en `readme/SISTEMA_CREDITOS.md`.
