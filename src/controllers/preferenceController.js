const { NotificationPreference } = require('../models');
const { ValidationError } = require('sequelize');

class PreferenceController {
  static async getAll(req, res, next) {
    try {
      const user_id = req.user.id;

      const preferences = await NotificationPreference.findAll({
        where: { user_id }
      });

      res.json({
        success: true,
        data: { preferences }
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { type } = req.params;
      const { is_enabled } = req.body;
      const user_id = req.user.id;

      const [preference, created] = await NotificationPreference.findOrCreate({
        where: { user_id, notification_type: type },
        defaults: { is_enabled }
      });

      if (!created) {
        await preference.update({ is_enabled });
      }

      res.json({
        success: true,
        data: preference
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        error.name = 'ValidationError';
      }
      next(error);
    }
  }

  static async updateBulk(req, res, next) {
    try {
      const { preferences } = req.body;
      const user_id = req.user.id;

      const updatedPreferences = [];

      for (const pref of preferences) {
        const [preference, created] = await NotificationPreference.findOrCreate({
          where: {
            user_id,
            notification_type: pref.notification_type
          },
          defaults: {
            is_enabled: pref.is_enabled
          }
        });

        if (!created) {
          await preference.update({
            is_enabled: pref.is_enabled
          });
        }

        updatedPreferences.push(preference);
      }

      res.json({
        success: true,
        data: {
          updated: updatedPreferences.length,
          preferences: updatedPreferences
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PreferenceController; 