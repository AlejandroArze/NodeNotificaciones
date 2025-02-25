const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { body, query } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

// POST /api/notifications/send
// Enviar notificación a un usuario específico
router.post('/send', [
  body('userId').isInt().withMessage('ID de usuario inválido'),
  body('title').notEmpty().withMessage('El título es requerido'),
  body('body').notEmpty().withMessage('El cuerpo es requerido'),
  body('type').notEmpty().withMessage('El tipo es requerido'),
  validate
], NotificationController.send);

// POST /api/notifications/broadcast
// Enviar notificación a todos los usuarios
router.post('/broadcast', [
  body('title').notEmpty().withMessage('El título es requerido'),
  body('body').notEmpty().withMessage('El cuerpo es requerido'),
  body('type').notEmpty().withMessage('El tipo es requerido'),
  validate
], NotificationController.broadcast);

// GET /api/notifications
// Obtener notificaciones con filtros
router.get('/', [
  query('page').optional().isInt().withMessage('Página inválida'),
  query('limit').optional().isInt().withMessage('Límite inválido'),
  query('status').optional().isIn(['pending', 'sent', 'failed', 'read']).withMessage('Estado inválido'),
  validate
], NotificationController.getAll);

// GET /api/notifications/unread
// Obtener notificaciones no leídas
router.get('/unread', NotificationController.getUnread);

// PUT /api/notifications/:id/read
// Marcar notificación como leída
router.put('/:id/read', NotificationController.markAsRead);

// POST /api/notifications/group
// Enviar notificación a un grupo de usuarios
router.post('/group', [
  body('userIds').isArray().withMessage('userIds debe ser un array'),
  body('userIds.*').isInt().withMessage('Todos los userIds deben ser números enteros'),
  body('title').notEmpty().withMessage('El título es requerido'),
  body('body').notEmpty().withMessage('El cuerpo es requerido'),
  body('type').notEmpty().withMessage('El tipo es requerido'),
  validate
], NotificationController.sendToGroup);

module.exports = router; 