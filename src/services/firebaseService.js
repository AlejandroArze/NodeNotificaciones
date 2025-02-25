const { admin } = require('../config/firebase');
const logger = require('../utils/logger');
const { DeviceToken } = require('../models');

class FirebaseService {
  static async verifyToken(token) {
    try {
      const decodedToken = await admin.messaging().send({
        token,
        data: { test: 'true' },
        android: { direct_boot_ok: true }
      }, true); // Dry run = true
      return true;
    } catch (error) {
      logger.error(`Token inválido: ${error.message}`);
      return false;
    }
  }

  static async sendNotification(notification, deviceTokens, data = {}) {
    try {
      if (!deviceTokens || deviceTokens.length === 0) {
        throw new Error('No hay tokens de dispositivo disponibles');
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          ...data,
          notification_id: notification.id.toString(),
          type: notification.type,
          click_action: 'FLUTTER_NOTIFICATION_CLICK' // Para Flutter/Android
        },
        apns: { // Configuración específica para iOS
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'content-available': 1
            }
          }
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            priority: 'max',
            channelId: 'default-channel'
          }
        }
      };

      if (deviceTokens.length === 1) {
        message.token = deviceTokens[0];
        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
      } else {
        message.tokens = deviceTokens;
        const response = await admin.messaging().sendMulticast(message);
        
        // Procesar tokens fallidos
        if (response.failureCount > 0) {
          const failedTokens = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push({
                token: deviceTokens[idx],
                error: resp.error.message
              });
            }
          });
          
          // Desactivar tokens inválidos
          await this.handleFailedTokens(failedTokens);
        }

        return {
          success: true,
          successCount: response.successCount,
          failureCount: response.failureCount
        };
      }
    } catch (error) {
      logger.error('Error al enviar notificación:', error);
      throw error;
    }
  }

  static async handleFailedTokens(failedTokens) {
    try {
      for (const { token, error } of failedTokens) {
        if (
          error.includes('not registered') || 
          error.includes('invalid-argument') ||
          error.includes('invalid-registration-token')
        ) {
          await DeviceToken.update(
            { is_active: false },
            { where: { device_token: token } }
          );
          logger.info(`Token desactivado: ${token}`);
        }
      }
    } catch (error) {
      logger.error('Error al manejar tokens fallidos:', error);
    }
  }

  static async subscribeToTopic(tokens, topic) {
    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      return true;
    } catch (error) {
      logger.error(`Error al suscribir a tema ${topic}:`, error);
      return false;
    }
  }

  static async unsubscribeFromTopic(tokens, topic) {
    try {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
      return true;
    } catch (error) {
      logger.error(`Error al desuscribir del tema ${topic}:`, error);
      return false;
    }
  }
}

module.exports = FirebaseService; 