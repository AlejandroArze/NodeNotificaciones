const { DeviceToken } = require('../models');
const { ValidationError } = require('sequelize');
const FirebaseService = require('../services/firebaseService');
const logger = require('../utils/logger');

class DeviceController {
  static async register(req, res, next) {
    try {
      const { device_token, device_type } = req.body;
      const user_id = req.user.id;

      // Verificar si el token es válido
      const isValid = await FirebaseService.verifyToken(device_token);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token de dispositivo inválido'
          }
        });
      }

      // Desactivar tokens anteriores del mismo dispositivo
      await DeviceToken.update(
        { is_active: false },
        { where: { device_token } }
      );

      const deviceToken = await DeviceToken.create({
        user_id,
        device_token,
        device_type
      });

      // Suscribir el token a temas relevantes
      await FirebaseService.subscribeToTopic([device_token], 'all_users');
      if (device_type === 'android') {
        await FirebaseService.subscribeToTopic([device_token], 'android_users');
      } else if (device_type === 'ios') {
        await FirebaseService.subscribeToTopic([device_token], 'ios_users');
      }

      res.status(201).json({
        success: true,
        data: deviceToken
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        error.name = 'ValidationError';
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const devices = await DeviceToken.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: { devices }
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const deviceToken = await DeviceToken.findOne({
        where: { id, user_id }
      });

      if (!deviceToken) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Dispositivo no encontrado'
          }
        });
      }

      // Desuscribir el token de los temas antes de desactivarlo
      await FirebaseService.unsubscribeFromTopic([deviceToken.device_token], 'all_users');
      await FirebaseService.unsubscribeFromTopic(
        [deviceToken.device_token], 
        `${deviceToken.device_type}_users`
      );

      await deviceToken.update({ is_active: false });

      res.json({
        success: true,
        message: 'Dispositivo eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const user_id = req.user.id;

      const deviceToken = await DeviceToken.findOne({
        where: { id, user_id }
      });

      if (!deviceToken) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Dispositivo no encontrado'
          }
        });
      }

      await deviceToken.update({ is_active });

      res.json({
        success: true,
        data: deviceToken
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DeviceController; 