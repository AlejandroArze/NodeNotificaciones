const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Agregar verificación de variables de entorno
console.log('Verificando variables de entorno de Firebase:', {
  projectId: process.env.FIREBASE_PROJECT_ID ? 'Definido' : 'No definido',
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'Definido' : 'No definido',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'Definido' : 'No definido'
});

const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./config/firebase');
const sequelize = require('./config/database');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar Firebase
initializeFirebase();

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/preferences', require('./routes/preferences'));

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: err.name || 'SERVER_ERROR',
      message: err.message || 'Error interno del servidor'
    }
  });
});

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const start = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    logger.info('Conexión a la base de datos establecida correctamente');

    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

start();
