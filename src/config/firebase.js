const admin = require('firebase-admin');
const logger = require('../utils/logger');

const initializeFirebase = () => {
  try {
    // Verificar que las variables de entorno estén definidas
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_PRIVATE_KEY || 
        !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('Faltan variables de entorno de Firebase');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        // La clave privada viene con \n escapados que necesitan ser reemplazados
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    
    logger.info('Firebase inicializado correctamente');
  } catch (error) {
    logger.error('Error al inicializar Firebase:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  admin
}; 