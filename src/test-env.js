require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
console.log('Variables de Firebase:', {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.substring(0, 20) + '...',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
});

const crypto = require('crypto');

// Generar clave JWT
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT Secret:', jwtSecret); 