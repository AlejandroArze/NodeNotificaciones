const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación',
        details: err.errors
      }
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: 'Error interno del servidor'
    }
  });
};

module.exports = errorHandler; 