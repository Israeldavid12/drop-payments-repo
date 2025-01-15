const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Função para buscar o token de autenticação
async function fetchToken() {
  const response = await axios.post(`${process.env.BASE_URL}/oauth/token`, {
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  });
  return response.data.access_token;
}

// Rota para processar o pagamento Emola
router.post('/pay', async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;
    const token = await fetchToken();

    const paymentResponse = await axios.post(
      `${process.env.BASE_URL}/c2b/emola-payment/`,
      { phoneNumber, amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.status(200).json(paymentResponse.data);
  } catch (error) {
    console.error('Erro ao processar pagamento Emola:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento Emola' });
  }
});

module.exports = router;
