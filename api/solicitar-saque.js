const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

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





// Endpoint para processar solicitação de saque
app.post('/api/solicitar-saque', async (req, res) => {
  console.log("Dados recebidos:", req.body);
  const { userId, valorSolicitado, type } = req.body;

  if (!userId || !valorSolicitado || !type) {
    return res.status(400).json({ message: 'Os campos userId, valorSolicitado e type são obrigatórios.' });
  }

  try {
    // Referências no Firebase
    const userRef = admin.database().ref(`users/${userId}`);
    const userPaymentMethodsRef = admin.database().ref(`users/${userId}/userpaymentMethods`);
    const withdrawHistoryRef = admin.database().ref(`users/${userId}/withdrawHistory`);
    const emailRef = admin.database().ref(`users/${userId}/email`);
    const balanceRef = admin.database().ref(`users/${userId}/balance`);
    const paypalBalanceRef = admin.database().ref(`users/${userId}/paypalBalance`);

    // Verifica o método de pagamento do usuário
    const userPaymentMethodsSnapshot = await userPaymentMethodsRef.once('value');
    if (!userPaymentMethodsSnapshot.exists()) {
      console.log("'Método de pagamento não configurado. Redirecionando para configuração.");
      return res.status(400).json({ message: 'Método de pagamento não configurado. Redirecionando para configuração.' });
    }

    const paymentData = userPaymentMethodsSnapshot.val();
    const metodo = paymentData.metodo;
    const numero = paymentData.numero;
    const titular = paymentData.titular;

    // Verifica o saldo disponível com base no tipo
    let availableBalanceSnapshot;
    let saldoMinimo;

    if (type === "mpesa-emola") {
      availableBalanceSnapshot = await balanceRef.once('value');
      saldoMinimo = 100; // Saldo mínimo para saque via Mpesa ou Emola
    } else if (type === "paypal") {
      availableBalanceSnapshot = await paypalBalanceRef.once('value');
      saldoMinimo = 2500; // Saldo mínimo para saque via PayPal
    } else {
      return res.status(400).json({ message: 'Tipo de saque inválido. Use "mpesa-emola" ou "paypal".' });
    }

    const availableBalance = availableBalanceSnapshot.val() || 0;

    if (valorSolicitado < saldoMinimo) {
      return res.status(400).json({ message: `O valor mínimo para saque da carteira ${type} é ${saldoMinimo} MT.` });
    }

    if (availableBalance < valorSolicitado) {
      return res.status(400).json({ message: 'Saldo insuficiente.' });
    }

    // Processa o saque (subtrai o valor solicitado do saldo)
    const newBalance = availableBalance - valorSolicitado;
    if (type === "mpesa-emola") {
      await balanceRef.set(newBalance);
    } else if (type === "paypal") {
      await paypalBalanceRef.set(newBalance);
    }

    // Salva o saque no histórico
    const withdrawalData = {
      valueAmount: valorSolicitado,
      amountPaid: valorSolicitado - (valorSolicitado * 0.08), // Subtrai uma taxa de 8%
      metodo,
      type,
      status: 'pendente',
      timestamp: new Date().toISOString(),
    };
    const newWithdrawalRef = await withdrawHistoryRef.push(withdrawalData);
    const withdrawalId = newWithdrawalRef.key; // Captura o ID gerado pelo Firebase

    // E-mail do usuário
    const emailSnapshot = await emailRef.once('value');
    const userEmail = emailSnapshot.val();
    if (!userEmail) {
      return res.status(400).json({ message: 'E-mail do usuário não encontrado.' });
    }

    // Prepare os payloads para os e-mails
    const payloadSendWidrawUser = {
      paymentMethod: metodo,
      paymentNumber: numero,
      paymentName: titular,
      amountPaid: valorSolicitado,
      emailSeller: userEmail,
      timestamp: new Date().toISOString(),
      templateType: "5-W",
    };

    const payloadSendWidrawAdmin = {
      paymentMethod: metodo,
      paymentNumber: numero,
      paymentName: titular,
      amountPaid: valorSolicitado,
      emailSeller: userEmail,
      paymentId: withdrawalId,
      userId: userId,
      timestamp: new Date().toISOString(),
      templateType: "5-W-Admin",
    };

    // Enviar os e-mails em paralelo
    const responses = await Promise.all([
      fetch('https://www.dropaymentsmz.online/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadSendWidrawUser),
      }),
      fetch('https://www.dropaymentsmz.online/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadSendWidrawAdmin),
      }),
    ]);

    // Verificar se as requisições foram bem-sucedidas
    const isSuccess = responses.every((response) => response.ok);
    if (isSuccess) {
      return res.status(200).json({ message: 'Saque solicitado com sucesso!' });
    } else {
      return res.status(500).json({ message: 'Erro ao enviar e-mails.' });
    }
  } catch (error) {
    console.error('Erro ao processar o saque:', error);
    res.status(500).json({ message: 'Erro ao processar a solicitação de saque.' });
  }
});







// Iniciar o servidor
const PORT = 3014;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
