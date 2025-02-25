const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

// POST /api/auth/register
// Registro de usuario
router.post('/register', [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate
], AuthController.register);

// POST /api/auth/login
// Inicio de sesión
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validate
], AuthController.login);

// POST /api/auth/logout
// Cerrar sesión
router.post('/logout', auth, AuthController.logout);

module.exports = router; 