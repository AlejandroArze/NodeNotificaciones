require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./config/firebase');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Inicializar Firebase
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', routes);

// Manejador de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
});
