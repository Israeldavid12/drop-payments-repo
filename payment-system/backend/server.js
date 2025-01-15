const express = require('express');
const bodyParser = require('body-parser');
const emolaRoutes = require('./routes/emola');
const mpesaRoutes = require('./routes/mpesa');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Rotas
app.use('/api/emola', emolaRoutes);
app.use('/api/mpesa', mpesaRoutes);

// Servidor rodando
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
