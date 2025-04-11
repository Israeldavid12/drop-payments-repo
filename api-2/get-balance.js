// Importa os pacotes necessários
const express = require('express');
const admin = require('firebase-admin');

const serviceAccount = require('../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app"
});

// Inicializa o app Express
const app = express();
const port = 3012;


// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Função para calcular o saldo
const calcularSaldo = async (userId) => {
  try {
    // Acessa os pagamentos do usuário
    const db = admin.database();
    const paymentsRef = db.ref(`users/${userId}/payments`);
    const snapshot = await paymentsRef.once('value');

    if (!snapshot.exists()) {
      return { saldoTotal: 0, saldoFeitoHoje: 0 };
    }

    const payments = snapshot.val();
    const today = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
    let saldoFeitoHoje = 0;
    let saldoTotal = 0;

    // Itera sobre os pagamentos
    Object.values(payments).forEach((payment) => {
      const paidAmount = parseFloat(payment.originalAmount || 0);
      const timestampISO = payment.timestamp || "";
      const transactionDate = new Date(timestampISO).toISOString().split("T")[0];

      saldoTotal += paidAmount;
      if (transactionDate === today) {
        saldoFeitoHoje += paidAmount;
      }
    });

    return { saldoTotal, saldoFeitoHoje };
  } catch (error) {
    console.error("Erro ao calcular o saldo:", error);
    throw new Error("Erro ao acessar os dados do Firebase.");
  }
};

// Endpoint para consultar saldo
app.get('/api/saldo/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const saldo = await calcularSaldo(userId);
    res.json(saldo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
