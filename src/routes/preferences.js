const express = require('express');
const router = express.Router();
const PreferenceController = require('../controllers/preferenceController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/preferences
// Obtener preferencias del usuario
router.get('/', PreferenceController.getAll);

// PUT /api/preferences/:type
// Actualizar una preferencia específica
router.put('/:type', [
  body('is_enabled').isBoolean().withMessage('is_enabled debe ser un booleano'),
  validate
], PreferenceController.update);

// POST /api/preferences/bulk
// Actualizar múltiples preferencias
router.post('/bulk', [
  body('preferences').isArray().withMessage('preferences debe ser un array'),
  body('preferences.*.notification_type').notEmpty().withMessage('notification_type es requerido'),
  body('preferences.*.is_enabled').isBoolean().withMessage('is_enabled debe ser un booleano'),
  validate
], PreferenceController.updateBulk);

module.exports = router; 