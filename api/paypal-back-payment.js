const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');
const admin = require('firebase-admin');
require('dotenv').config();

// Função para inicializar o Firebase
async function initializeFirebase() {
  try {
    const serviceAccount = require('../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app',
    });

    console.log('Firebase inicializado com sucesso.');
  } catch (err) {
    console.error('Erro ao inicializar Firebase:', err);
    process.exit(1); // Encerra o processo em caso de erro
  }
}

initializeFirebase();

// Configuração do PayPal
paypal.configure({
  mode: 'live', // Use 'sandbox' para testes, 'live' para produção
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// Criar servidor Express
const app = express();
app.use(bodyParser.json());

let payerEmail = '';
let payerName = '';

// Configuração de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Endpoint para iniciar pagamento com PayPal
app.post('/api/paypal-back-payment', (req, res) => {
  const { amount, clientId, sucessPage, cancelPage, bidUSD, productId, nameProduct } = req.body;
  console.log(req.body);

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: amount,
        },
        description: 'payment produto',
      },
    ],
    redirect_urls: {
      return_url: `https://www.dropaymentsmz.online/update/paypal-success?clientId=${encodeURIComponent(clientId)}&sucessPage=${encodeURIComponent(sucessPage)}&bidUSD=${encodeURIComponent(bidUSD)}&emailPayer=${encodeURIComponent(payerEmail)}&productId=${encodeURIComponent(productId)}&nameProduct=${encodeURIComponent(nameProduct)}`,
      cancel_url: `https://www.dropaymentsmz.online/api/paypal-cancel?cancelPage=${encodeURIComponent(cancelPage)}`,
    },
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error('Erro ao criar pagamento:', error);
      res.status(500).json({ error: 'Erro ao processar o pagamento' });
    } else {
      const approvalUrl = payment.links.find((link) => link.rel === 'approval_url').href;
      res.status(200).json({ approvalUrl });
    }
  });
});

// Endpoint para processar sucesso do pagamento
app.get('/api/paypal-success', async (req, res) => {
  const { PayerID, paymentId, clientId, sucessPage, bidUSD, productId, nameProduct } = req.query;
  
  console.log('Parâmetros recebidos:', req.query);

  if (!PayerID || !paymentId || !clientId) {
    return res.status(400).json({ message: 'Dados insuficientes para processar o pagamento' });
  }

  try {
    const paymentDetails = await new Promise((resolve, reject) => {
      paypal.payment.get(paymentId, (error, payment) => {
        if (error) reject(error);
        else resolve(payment);
      });
    });

    const amount = paymentDetails.transactions[0].amount.total;
    const currency = paymentDetails.transactions[0].amount.currency;
    const payerInfo = paymentDetails.payer.payer_info;
    const namePayer = `${payerInfo.first_name} ${payerInfo.last_name}`;
    const emailPayer = payerInfo.email;
    payerEmail = payerInfo.email;
    payerName = `${payerInfo.first_name} ${payerInfo.last_name}`;

    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: currency,
            total: amount,
          },
        },
      ],
    };

    const executedPayment = await new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) reject(error);
        else resolve(payment);
      });
    });

    const transactionDetails = executedPayment.transactions[0].related_resources[0].sale;
    const total = parseFloat(transactionDetails.amount.total);
    const fee = parseFloat(transactionDetails.transaction_fee.value);
    const netAmount = (total - fee).toFixed(2);
    const meticalNetAmount = (netAmount * parseFloat(bidUSD)).toFixed(2);
    const paymentIdDB = new Date().getTime().toString();
    const paymentData = {
      orderId: executedPayment.id,
      originalAmount: meticalNetAmount,
      paidAmount: amount,
      paymentName: namePayer,
      paymentEmail: emailPayer,
      paymentMethod: 'PayPal',
      status: 'approved',
      description: paymentDetails.transactions[0].description,
      currency: currency,
      timestamp: new Date().toISOString(),
    };

    console.log('Dados do pagamento:', paymentData);

    const paymentPromises = [
      admin.database().ref(`users/${clientId}/payments/${paymentIdDB}`).set(paymentData),
      admin.database().ref(`users/${clientId}/paymentsBackup/${paymentIdDB}`).set(paymentData),
      admin.database().ref(`usersPaymentsBackup/${paymentIdDB}`).set(paymentData),
    ];

    await Promise.all(paymentPromises);

    console.log('Pagamento salvo com sucesso!');
    const successPageUrl = `${sucessPage}?id=${encodeURIComponent(productId)}&emailPayer=${encodeURIComponent(payerEmail)}&namePayer=${encodeURIComponent(payerName)}&nameProduct=${encodeURIComponent(nameProduct)}`;
    return res.redirect(successPageUrl); 
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return res.status(500).json({ message: 'Erro ao processar ou salvar pagamento.', error });
  }
});

// Endpoint para processar cancelamento do pagamento
app.get('/api/paypal-cancel', (req, res) => {
  const { cancelPage } = req.query;

  if (!cancelPage) {
    return res.status(400).json({ message: 'URL de cancelamento não fornecida.' });
  }

  console.log('Pagamento cancelado. Redirecionando para:', cancelPage);
  res.redirect(cancelPage);
});

// Iniciar o servidor
const port = process.env.PORT || 3010;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
