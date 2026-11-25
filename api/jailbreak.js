const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios")

const app = express();

// Middleware para permitir CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());     



app.post('/api/jailbreak', async (req, res) => {
  return res.status(202).json({
    accepted: true
  })
})


// const PORT = 3014;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });
