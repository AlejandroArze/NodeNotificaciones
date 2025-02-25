const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const deviceRoutes = require('./devices');
const notificationRoutes = require('./notifications');
const preferenceRoutes = require('./preferences');

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/preferences', preferenceRoutes);

module.exports = router; 