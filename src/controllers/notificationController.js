const { Notification, DeviceToken, NotificationPreference, User } = require('../models');
const FCMService = require('../services/fcmService');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class NotificationController {
  static async send(req, res, next) {
    try {
      const { userId, title, body, data, type } = req.body;

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

      // Obtener tokens de dispositivo activos
      const deviceTokens = await DeviceToken.findAll({
        where: { user_id: userId, is_active: true }
      });

      if (deviceTokens.length > 0) {
        // Enviar notificación a través de FCM
        await FCMService.sendToMultipleDevices(
          deviceTokens.map(dt => dt.device_token),
          notification,
          data
        );

        // Actualizar estado de la notificación
        await notification.update({
          status: 'sent',
          sent_at: new Date()
        });
      }

      res.status(201).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  static async broadcast(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { title, body, data, type } = req.body;

      // Obtener usuarios con preferencias activas
      const users = await User.findAll({
        include: [{
          model: NotificationPreference,
          where: {
            notification_type: type,
            is_enabled: true
          },
          required: false
        }]
      });

      const notifications = [];
      const deviceTokensBatch = [];

      for (const user of users) {
        // Crear notificación para cada usuario
        const notification = await Notification.create({
          user_id: user.id,
          title,
          body,
          data,
          type
        }, { transaction: t });

        notifications.push(notification);

        // Obtener tokens de dispositivo activos
        const deviceTokens = await DeviceToken.findAll({
          where: { user_id: user.id, is_active: true }
        });

        deviceTokensBatch.push(...deviceTokens.map(dt => dt.device_token));
      }

      if (deviceTokensBatch.length > 0) {
        // Enviar notificaciones en lotes
        const response = await FCMService.sendToMultipleDevices(
          deviceTokensBatch,
          { title, body },
          data
        );

        // Actualizar estado de las notificaciones
        await Notification.update(
          {
            status: 'sent',
            sent_at: new Date()
          },
          {
            where: { id: notifications.map(n => n.id) },
            transaction: t
          }
        );
      }

      await t.commit();

      res.status(201).json({
        success: true,
        data: {
          total_notifications: notifications.length,
          total_devices: deviceTokensBatch.length
        }
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async bulk(req, res, next) {
    const t = await sequelize.transaction();
    try {
      const { userIds, title, body, data, type } = req.body;

      // Verificar preferencias de usuarios
      const users = await User.findAll({
        where: { id: userIds },
        include: [{
          model: NotificationPreference,
          where: {
            notification_type: type,
            is_enabled: true
          },
          required: false
        }]
      });

      const notifications = [];
      const deviceTokensBatch = [];

      for (const user of users) {
        // Crear notificación para cada usuario
        const notification = await Notification.create({
          user_id: user.id,
          title,
          body,
          data,
          type
        }, { transaction: t });

        notifications.push(notification);

        // Obtener tokens de dispositivo activos
        const deviceTokens = await DeviceToken.findAll({
          where: { user_id: user.id, is_active: true }
        });

        deviceTokensBatch.push(...deviceTokens.map(dt => dt.device_token));
      }

      if (deviceTokensBatch.length > 0) {
        // Enviar notificaciones en lotes
        const response = await FCMService.sendToMultipleDevices(
          deviceTokensBatch,
          { title, body },
          data
        );

        // Actualizar estado de las notificaciones
        await Notification.update(
          {
            status: 'sent',
            sent_at: new Date()
          },
          {
            where: { id: notifications.map(n => n.id) },
            transaction: t
          }
        );
      }

      await t.commit();

      res.status(201).json({
        success: true,
        data: {
          total_notifications: notifications.length,
          total_devices: deviceTokensBatch.length
        }
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const user_id = req.user.id;

      const where = { user_id };
      if (status) {
        where.status = status;
      }

      const notifications = await Notification.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          notifications: notifications.rows,
          pagination: {
            total: notifications.count,
            page: parseInt(page),
            pages: Math.ceil(notifications.count / limit)
          }
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
      const user_id = req.user.id;

      const notifications = await Notification.findAll({
        where: {
          user_id,
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