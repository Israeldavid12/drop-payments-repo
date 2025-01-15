const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');

// Configuração do PayPal
paypal.configure({
  mode: 'sandbox', // Use 'live' para produção
  client_id: 'Ac-X_2mSdDUlHyk9_Ej-gCzGN3Jc_7QKJI97QIFRT7q99zV5L-Qau9UWl8Iu4tvR6b16Jr10CDCywoO9',
  client_secret: 'Ac-X_2mSdDUlHyk9_Ej-gCzGN3Jc_7QKJI97QIFRT7q99zV5L-Qau9UWl8Iu4tvR6b16Jr10CDCywoO9',
});

// Criar servidor Express
const app = express();
app.use(bodyParser.json()); // Parse JSON no corpo das requisições


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Rota para criar pagamento
app.post('/api/sandbox/paypal-payment', (req, res) => {
  const { amount, currency, description } = req.body;

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    transactions: [
      {
        amount: {
          currency: currency,
          total: amount,
        },
        description: description,
      },
    ],
    redirect_urls: {
      return_url: 'http://localhost:3010/api/paypal-success',
      cancel_url: 'http://localhost:3010/api/paypal-cancel',
    },
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error('Erro ao criar pagamento:', error);
      res.status(500).json({ error: 'Erro ao processar o pagamento' });
    } else {
      // Retorna URL de aprovação do PayPal
      const approvalUrl = payment.links.find(
        (link) => link.rel === 'approval_url'
      ).href;

      res.status(200).json({ approvalUrl });
    }
  });
});

// Rota para capturar o pagamento
app.get('/api/paypal-success', (req, res) => {
  const { paymentId, PayerID } = req.query;

  const execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: 'USD', // Certifique-se de usar a moeda correta
          total: amonut, // Total do pagamento (atualize dinamicamente)
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    if (error) {
      console.error('Erro ao capturar pagamento:', error.response);
      res.status(500).json({ error: 'Erro ao capturar o pagamento' });
    } else {
      res.status(200).json({
        message: 'Pagamento realizado com sucesso!',
        payment,
      });
    }
  });
});

// Rota para cancelamento do pagamento
app.get('/api/paypal-cancel', (req, res) => {
  res.status(200).send('Pagamento foi cancelado pelo usuário.');
});

// Iniciar o servidor
const PORT = 3010;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
