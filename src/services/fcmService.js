const { admin } = require('../config/firebase');
const logger = require('../utils/logger');

class FCMService {
  static async sendToDevice(deviceToken, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          ...data,
          notificationId: notification.id.toString()
        },
        token: deviceToken
      };

      const response = await admin.messaging().send(message);
      logger.info(`Notificación enviada exitosamente: ${response}`);
      return response;
    } catch (error) {
      logger.error(`Error al enviar notificación: ${error}`);
      throw error;
    }
  }

  static async sendToMultipleDevices(deviceTokens, notification, data = {}) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          ...data,
          notificationId: notification.id.toString()
        },
        tokens: deviceTokens
      };

      const response = await admin.messaging().sendMulticast(message);
      logger.info(`Notificación múltiple enviada: ${response.successCount} exitosas, ${response.failureCount} fallidas`);
      return response;
    } catch (error) {
      logger.error(`Error al enviar notificación múltiple: ${error}`);
      throw error;
    }
  }
}

module.exports = FCMService; 