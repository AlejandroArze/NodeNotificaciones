const { Notification, DeviceToken, NotificationPreference, User } = require('../models');
const NotificationService = require('../services/notificationService');
const { ValidationError, Op } = require('sequelize');
const logger = require('../utils/logger');

class NotificationController {
  static async send(req, res, next) {
    try {
      const { userId, title, body, data, type } = req.body;

      // Verificar si el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Usuario no encontrado'
          }
        });
      }

      // Verificar preferencias del usuario
      const preference = await NotificationPreference.findOne({
        where: { user_id: userId, notification_type: type }
      });

      if (preference && !preference.is_enabled) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOTIFICATIONS_DISABLED',
            message: 'El usuario ha desactivado este tipo de notificaciones'
          }
        });
      }

      // Crear notificación
      const notification = await Notification.create({
        user_id: userId,
        title,
        body,
        data,
        type
      });

      // Enviar notificación
      const result = await NotificationService.send(notification, userId);

      res.status(201).json({
        success: true,
        data: {
          notification,
          sent: result.success
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async broadcast(req, res, next) {
    try {
      const { title, body, data, type } = req.body;

      // Obtener todos los usuarios con tokens activos
      const deviceTokens = await DeviceToken.findAll({
        where: { is_active: true },
        include: [{
          model: User,
          required: true,
          include: [{
            model: NotificationPreference,
            where: {
              notification_type: type,
              is_enabled: true
            },
            required: false
          }]
        }]
      });

      if (deviceTokens.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_ACTIVE_DEVICES',
            message: 'No hay dispositivos activos para enviar la notificación'
          }
        });
      }

      // Crear notificaciones para cada usuario
      const notifications = await Promise.all(
        deviceTokens.map(token => 
          Notification.create({
            user_id: token.user_id,
            title,
            body,
            data,
            type
          })
        )
      );

      // Enviar notificaciones
      const result = await NotificationService.sendBulk(
        { title, body, data, type },
        deviceTokens.map(token => token.device_token)
      );

      res.status(201).json({
        success: true,
        data: {
          notifications_created: notifications.length,
          sent: result.successCount,
          failed: result.failureCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const where = { user_id: req.user.id };
      if (status) {
        where.status = status;
      }

      const { count, rows: notifications } = await Notification.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          total: count,
          pages: Math.ceil(count / limit),
          current_page: parseInt(page),
          notifications
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const notification = await Notification.findOne({
        where: { id, user_id }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notificación no encontrada'
          }
        });
      }

      await notification.update({
        status: 'read',
        read_at: new Date()
      });

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnread(req, res, next) {
    try {
      const notifications = await Notification.findAll({
        where: {
          user_id: req.user.id,
          status: { [Op.ne]: 'read' }
        },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          count: notifications.length,
          notifications
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController; 