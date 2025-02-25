const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DeviceToken extends Model {}

DeviceToken.init({
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
  device_token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  device_type: {
    type: DataTypes.ENUM('android', 'ios', 'web'),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_used_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'DeviceToken',
  tableName: 'device_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = DeviceToken; 