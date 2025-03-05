const { User, UserSession } = require('../models');
const jwt = require('jsonwebtoken');
const { ValidationError } = require('sequelize');
const logger = require('../utils/logger');

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Log de inicio de registro
      logger.info('Iniciando registro de usuario', { 
        email,
        timestamp: new Date().toISOString(),
        ip: req.ip
      });

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        logger.warn('Intento de registro con email existente', { 
          email,
          timestamp: new Date().toISOString()
        });

        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'El email ya está registrado'
          }
        });
      }

      // Crear usuario
      const hashedPassword = await User.hashPassword(password);
      const user = await User.create({
        name,
        email,
        password: hashedPassword
      });

      // Log de usuario creado
      logger.info('Usuario registrado exitosamente', { 
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      });

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Crear sesión
      const session = await UserSession.create({
        user_id: user.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      // Log de sesión creada
      logger.info('Sesión de usuario creada', { 
        userId: user.id,
        sessionId: session.id,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      // Log de error en registro
      logger.error('Error en registro de usuario', {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      if (error instanceof ValidationError) {
        error.name = 'ValidationError';
      }
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Log de intento de login
      logger.info('Intento de login', { 
        email,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      // Buscar usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Log de usuario no encontrado
        logger.warn('Intento de login con usuario no existente', { 
          email,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });

        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales inválidas'
          }
        });
      }

      // Validar contraseña
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        // Log de contraseña incorrecta
        logger.warn('Intento de login con contraseña incorrecta', { 
          email,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });

        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Credenciales inválidas'
          }
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Log de login exitoso
      logger.info('Login exitoso', { 
        userId: user.id,
        email: user.email,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      // Crear sesión
      const session = await UserSession.create({
        user_id: user.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      });

      // Log de sesión creada
      logger.info('Sesión de usuario creada', { 
        userId: user.id,
        sessionId: session.id,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      // Log de error en login
      logger.error('Error en login de usuario', {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      // Log de intento de logout
      logger.info('Intento de logout', { 
        userId: req.user.id,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      // Desactivar todas las sesiones activas del usuario
      const [updatedCount] = await UserSession.update(
        { is_active: false },
        { 
          where: { 
            user_id: req.user.id,
            is_active: true 
          }
        }
      );

      // Log de sesiones cerradas
      logger.info('Sesiones de usuario cerradas', { 
        userId: req.user.id,
        sessionsClosedCount: updatedCount,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    } catch (error) {
      // Log de error en logout
      logger.error('Error en logout de usuario', {
        userId: req.user.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      next(error);
    }
  }
}

module.exports = AuthController; 