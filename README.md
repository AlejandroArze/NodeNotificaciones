# NodeNotificaciones

Sistema de notificaciones push utilizando Node.js y Firebase Cloud Messaging (FCM).

## Características principales

- Gestión de usuarios y sesiones
- Registro de dispositivos para notificaciones push
- Envío de notificaciones push mediante Firebase Cloud Messaging
- Gestión de preferencias de notificaciones
- Historial y estado de notificaciones

## APIs propuestas

### Autenticación
- POST /api/auth/register - Registro de usuarios
- POST /api/auth/login - Inicio de sesión
- POST /api/auth/logout - Cierre de sesión

### Dispositivos
- POST /api/devices/register - Registrar token de dispositivo
- DELETE /api/devices/:id - Eliminar token de dispositivo
- PUT /api/devices/:id - Actualizar estado del token

### Notificaciones
- POST /api/notifications/send - Enviar notificación a un usuario específico
- POST /api/notifications/broadcast - Enviar notificación a todos los usuarios
- POST /api/notifications/bulk - Enviar notificación a múltiples usuarios seleccionados
- GET /api/notifications - Obtener historial de notificaciones
- PUT /api/notifications/:id/read - Marcar notificación como leída
- GET /api/notifications/unread - Obtener notificaciones no leídas


### Preferencias
- GET /api/preferences - Obtener preferencias de notificaciones
- PUT /api/preferences/:type - Actualizar preferencia de notificación
- POST /api/preferences/bulk - Actualizar múltiples preferencias

## Flujo de trabajo

1. El usuario se registra/inicia sesión en la aplicación
2. La aplicación registra el token del dispositivo
3. El usuario configura sus preferencias de notificaciones
4. El sistema envía notificaciones según las preferencias del usuario
5. Las notificaciones se entregan a través de FCM
6. El sistema actualiza el estado de las notificaciones
