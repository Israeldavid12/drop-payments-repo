const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Inicialize o Firebase Admin SDK
const serviceAccount = require("../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json"); // Substitua pelo seu arquivo de credenciais

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app", // Substitua pela URL do seu banco de dados
});

const db = admin.database();
const app = express();

// Middleware para permitir CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

// Rota para calcular e atualizar o saldo
app.post("/api/balance", async (req, res) => {
  console.log("Recebendo solicitação para /api/balance");
  console.log("Dados recebidos:", req.body);
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).send({ error: "userId é obrigatório." });
  }

  try {
    const paymentsRef = db.ref(`users/${userId}/payments`);
    const balanceRef = db.ref(`users/${userId}/balance`);
    const emailRef = db.ref(`users/${userId}/email`);
    const nameRef = db.ref(`users/${userId}/name`);

    const paypalBalanceRef = db.ref(`users/${userId}/paypalBalance`);
    let total = 0;
    let vendasHoje = 0;
    let paypalBalance = 0;

    // Obter a data de hoje
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // Recuperar todas as transações
    const snapshot = await paymentsRef.once("value");

    const updates = {}; // Objeto para batch updates
    let foundNewTransactions = false;
    let foundNewPayPalTransactions = false;

    snapshot.forEach((childSnapshot) => {
      const payment = childSnapshot.val();
      const paymentKey = childSnapshot.key;

      // Verifique o estado da transação para saldo geral
      if ( payment.estado !== "computado" &&
        payment.originalAmount &&
        (payment.paymentMethod === "E-Mola" || payment.paymentMethod === "M-pesa"  || payment.paymentMethod === "dp-wallet" ))
      {
        total += parseFloat(payment.originalAmount);
        foundNewTransactions = true;

        // Marcar transação como computada
        updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
      }

      // Calcular vendas realizadas hoje
      if (payment.timestamp && payment.originalAmount) {
        const paymentDate = new Date(payment.timestamp).toISOString();
        if (paymentDate >= startOfDay && paymentDate <= endOfDay) {
          vendasHoje += parseFloat(payment.originalAmount);
        } 
      }

      // Verifique se a transação é do PayPal
      if (payment.paymentMethod === "PayPal" && payment.estado !== "computado" && payment.originalAmount) {
        paypalBalance += parseFloat(payment.originalAmount);
        foundNewPayPalTransactions = true; 

        // Marcar transação como computada
        updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
      }
    });

    // Arredondar valores para 2 casas decimais
    total = parseFloat(total.toFixed(2));
    vendasHoje = parseFloat(vendasHoje.toFixed(2));
    paypalBalance = parseFloat(paypalBalance.toFixed(2));

    //Pegar informacoes do usuario
    const emailSnapshot = await emailRef.once("value");
    const user_email = emailSnapshot.val() || 'N/A';
    const namelSnapshot = await nameRef.once("value");
    const user_name = namelSnapshot.val() || 'N/A';

    // Recuperar o saldo atual
    const balanceSnapshot = await balanceRef.once("value");
    const currentBalance = balanceSnapshot.val() || 0;

    const paypalBalanceSnapshot = await paypalBalanceRef.once("value");
    const currentPayPalBalance = paypalBalanceSnapshot.val() || 0;

    // Somar os saldos atuais com os novos valores (se houver)
    const newBalance = foundNewTransactions ? currentBalance + total : currentBalance;
    const newPayPalBalance = foundNewPayPalTransactions ? currentPayPalBalance + paypalBalance : currentPayPalBalance;

    // Atualizar os saldos no diretório do usuário
    updates[`users/${userId}/balance`] = newBalance;
    updates[`users/${userId}/paypalBalance`] = newPayPalBalance;

    // Salvar todas as atualizações no banco de dados
    await db.ref().update(updates);

    // Retornar o valor do saldo atualizado, PayPal e vendas do dia
    res.status(200).send({ balance: newBalance, vendasHoje, paypalBalance: newPayPalBalance, user_name: user_name, user_email: user_email });
  } catch (error) {
    console.error("Erro ao processar o saldo:", error);
    res.status(500).send({ error: "Erro ao processar o saldo." });
  }
});






// Endpoint para obter o nome do usuário pelo email
app.post('/api/get-user-info', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'O email é obrigatório.' });
    }

    // Obter o ID do usuário pelo email
    const userRecord = await admin.auth().getUserByEmail(email);
    const userId = userRecord.uid;

    // Acessar o diretório do Realtime Database
    const db = admin.database();
    const userRef = db.ref(`users/${userId}/name`);
    const userNameSnapshot = await userRef.once('value');
    const userName = userNameSnapshot.val();

    if (!userName) {
      return res.status(404).json({ error: 'Nome do usuário não encontrado.' });
    }

    // Retornar o nome e email do usuário
    res.json({
      email: email,
      name: userName,
      userId: userId,
      estado: "success"
    });
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
});

// Endpoint de pagamento
app.post('/api/send-amount', async (req, res) => {
  const { userId, email, sender_id, balance_wallet, wallet_destin, amount, sender_email } = req.body;

  if (!userId || !email || !sender_id || !balance_wallet || !wallet_destin || !amount) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
      // Recuperar o saldo atual do remetente
      const senderBalanceRef = db.ref(`users/${sender_id}/balance`);
      const senderBalanceSnapshot = await senderBalanceRef.once('value');

      const senderBalance = senderBalanceSnapshot.val();
      if (senderBalance < amount) {
          return res.status(400).json({ error: 'Saldo insuficiente.' });
      }

      // Deduzir o valor do saldo do remetente
      const newSenderBalance = senderBalance - amount;
      await senderBalanceRef.set(newSenderBalance);

      // Subtrair a taxa de 8
      const fee = 8;
      const amountAfterFee = amount - fee;

      // Gerar ID único para o pagamento
      const paymentId = uuidv4();
      const timestamp = Date.now();

      // Salvar a taxa de 8 no diretório especificado
      await db.ref(`users/iIpkewISsJTlu0Lh7d1YxJ3ZTK12/payments/${paymentId}`).set({
          originalAmount: fee,
          paymentMethod: 'dp-wallet',
          timestamp: timestamp
      });

      // Salvar o valor restante no diretório do destinatário
      await db.ref(`users/${userId}/payments/${paymentId}`).set({
          originalAmount: amount-8,
          timestamp: timestamp,
          paymentMethod: wallet_destin
      });

      // Enviar a requisição para o endpoint de email
      const emailPayload = {
          emailSeller: email,
          originalAmount: amount,
          amountPaid: amountAfterFee, 
          fee: fee,
          paymentId: paymentId,
          timestamp: new Date().toISOString(),
          templateType: '8-P-R' 
      };

      await axios.post('http://127.0.0.1:3001/api/send-email', emailPayload);

      // Responder com sucesso
      res.status(200).json({
          message: 'sent',
          paymentId: paymentId
      });
  } catch (error) {
      console.error('Erro ao processar o pagamento:', error);
      res.status(500).json({ error: 'Erro ao processar o pagamento.' });
  }
});

// Iniciar o servidor
const PORT = 3013;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
