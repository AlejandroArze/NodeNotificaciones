const { Notification, DeviceToken, NotificationPreference } = require('../models');
const FirebaseService = require('./firebaseService');
const logger = require('../utils/logger');

class NotificationService {
  static async send(notification, userId) {
    try {
      // Obtener tokens activos del usuario
      const deviceTokens = await DeviceToken.findAll({
        where: { 
          user_id: userId,
          is_active: true
        }
      });

      if (deviceTokens.length === 0) {
        logger.info(`Usuario ${userId} no tiene dispositivos registrados`);
        return false;
      }

      const tokens = deviceTokens.map(dt => dt.device_token);
      
      // Enviar notificación a través de Firebase
      const result = await FirebaseService.sendNotification(
        notification,
        tokens,
        notification.data
      );

      // Actualizar estado de la notificación
      await notification.update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date() : null
      });

      return result;
    } catch (error) {
      logger.error('Error al enviar notificación:', error);
      throw error;
    }
  }

  static async sendBulk(notification, userIds) {
    try {
      // Obtener todos los tokens activos de los usuarios
      const deviceTokens = await DeviceToken.findAll({
        where: { 
          user_id: userIds,
          is_active: true
        }
      });

      if (deviceTokens.length === 0) {
        logger.info('No hay dispositivos registrados para los usuarios seleccionados');
        return false;
      }

      const tokens = deviceTokens.map(dt => dt.device_token);

      // Enviar notificación a través de Firebase
      const result = await FirebaseService.sendNotification(
        notification,
        tokens,
        notification.data
      );

      return result;
    } catch (error) {
      logger.error('Error al enviar notificación masiva:', error);
      throw error;
    }
  }

  static async sendToTopic(notification, topic) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          ...notification.data,
          notification_id: notification.id.toString(),
          type: notification.type
        },
        topic
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      logger.error(`Error al enviar notificación al tema ${topic}:`, error);
      throw error;
    }
  }
}

module.exports = NotificationService; 