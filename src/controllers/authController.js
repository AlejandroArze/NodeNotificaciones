const { User, UserSession } = require('../models');
const jwt = require('jsonwebtoken');
const { ValidationError } = require('sequelize');

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
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

      // Generar token JWT
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Crear sesión
      await UserSession.create({
        user_id: user.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
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
      if (error instanceof ValidationError) {
        error.name = 'ValidationError';
      }
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findOne({ where: { email } });
      if (!user || !(await user.validatePassword(password))) {
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

      // Crear sesión
      await UserSession.create({
        user_id: user.id,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
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
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      // Desactivar todas las sesiones activas del usuario
      await UserSession.update(
        { is_active: false },
        { 
          where: { 
            user_id: req.user.id,
            is_active: true 
          }
        }
      );

      res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController; 