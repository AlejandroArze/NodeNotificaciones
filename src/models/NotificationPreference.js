const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class NotificationPreference extends Model {}

NotificationPreference.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notification_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'NotificationPreference',
  tableName: 'notification_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = NotificationPreference; 