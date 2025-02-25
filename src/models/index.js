const User = require('./User');
const UserSession = require('./UserSession');
const DeviceToken = require('./DeviceToken');
const Notification = require('./Notification');
const NotificationPreference = require('./NotificationPreference');

// Definir relaciones
User.hasMany(UserSession, { foreignKey: 'user_id' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(DeviceToken, { foreignKey: 'user_id' });
DeviceToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(NotificationPreference, { foreignKey: 'user_id' });
NotificationPreference.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  UserSession,
  DeviceToken,
  Notification,
  NotificationPreference
}; 