const express = require('express');
const router = express.Router();
const DeviceController = require('../controllers/deviceController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

router.use(auth); // Todas las rutas requieren autenticación

// POST /api/devices/register
// Registrar un nuevo dispositivo
router.post('/register', [
  body('device_token').notEmpty().withMessage('El token del dispositivo es requerido'),
  body('device_type').isIn(['android', 'ios', 'web']).withMessage('Tipo de dispositivo inválido'),
  validate
], DeviceController.register);

// GET /api/devices
// Obtener todos los dispositivos del usuario
router.get('/', DeviceController.getAll);

// PUT /api/devices/:id
// Actualizar estado de un dispositivo
router.put('/:id', [
  body('is_active').isBoolean().withMessage('is_active debe ser un booleano'),
  validate
], DeviceController.update);

// DELETE /api/devices/:id
// Eliminar un dispositivo
router.delete('/:id', DeviceController.delete);

module.exports = router; 