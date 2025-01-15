import express from 'express';
import axios from 'axios';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import timeout from 'connect-timeout'; // Importa o middleware de timeout
import { readFile } from 'fs/promises';

// Carrega as variáveis de ambiente
dotenv.config();

async function getServiceAccount() {
    const data = await readFile(new URL('../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json', import.meta.url));
    return JSON.parse(data);
}

const serviceAccount = await getServiceAccount();

// Inicializa o Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app"
});

const app = express();
const PORT = 4000;

// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json()); // Middleware para parsear JSON
app.use(timeout('60s')); // Define o tempo máximo de execução da requisição

// Middleware para finalizar a requisição se o tempo esgotar
app.use((req, res, next) => {
    if (!req.timedout) next(); // Se o tempo não esgotou, continua para o próximo middleware
});

// Variáveis para caching do token
let cachedToken = null;
let tokenExpiration = null;

// Função para gerar um token de acesso
async function generateAccessToken() {
    // Verifica se o token está em cache e se não expirou
    if (cachedToken && tokenExpiration > Date.now()) {
        return cachedToken;
    }

    try {
        const response = await axios.post('https://e2payments.explicador.co.mz/oauth/token', {
            grant_type: 'client_credentials',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        });
        
        cachedToken = response.data.access_token;
        tokenExpiration = Date.now() + (response.data.expires_in * 1000); // Cache por duração do token
        return cachedToken;
    } catch (error) {
        console.error('Erro ao gerar token de acesso', error.response?.data || error.message);
        throw error;
    }
}

// Função para processar o pagamento
async function processPayment(paymentMethod, payload, token) {
    const endpointMap = {
        'mpesa': 'https://e2payments.explicador.co.mz/v1/c2b/mpesa-payment/992038',
        'emola': 'https://e2payments.explicador.co.mz/v1/c2b/emola-payment/992039'
    };

    const endpointUrl = endpointMap[paymentMethod];
    if (!endpointUrl) {
        throw new Error('Método de pagamento inválido');
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json"
    };

    try {
        const response = await axios.post(endpointUrl, payload, { headers });
        return response.data; // Retorna a resposta da API externa
    } catch (error) {
        console.error('Erro na transação de pagamento', error.response?.data || error.message);
        throw error;
    }
}

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor está rodando com sucesso! (PAYMENT API)');
});

// Rota para processar pagamentos
app.post('/api/pay-shopify', async (req, res) => {
    console.log('Requisição recebida:', req.body);

    const { paymentMethod, amount, phone, reference, userId, productId, paymentName, paymentEmail, paymentWhatsapp, originalAmount, paymentMethodDb, nome,  storeName,  productName,  amountPaid, quantity, nameBuyer, emailBuyer, whatsappBuyer, adress, orderId, emailSeller} = req.body;
 
    // Verifica se todos os dados necessários estão presentes
    if (!paymentMethod || !amount || !phone || !reference || !userId || !productId || !originalAmount) {
        return res.status(400).json({ message: 'Dados insuficientes para processar o pagamento' });
    }

    try {
        console.log('Gerando token...');
        const token = await generateAccessToken();
        console.log('Token gerado:', token);

        const payload = {
            client_id: '9ba19544-740b-4886-8727-275d483ecb92',
            amount: amount,
            phone: phone,
            reference: reference,
            fromApp: 'e2PaymentsServer',
        };

        console.log('Processando pagamento...', payload);
        const paymentResponse = await processPayment(paymentMethod, payload, token);
        console.log('Pagamento processado com sucesso:', paymentResponse);
        
          // Payload para o e-mail do vendedor
          const payloadSeller = {
            productName: productName, // Verifica se o parâmetro existe
            storeName:  storeName, // Verifica se o parâmetro existe
            amountPaid: amountPaid,
            whatsappBuyer: whatsappBuyer,
            quantity: quantity,
            nameBuyer: nameBuyer,
            emailSeller: emailSeller,
            emailBuyer: emailBuyer, // E-mail do vendedor
            adress: adress,
            timestamp: new Date().toISOString(),
            templateType: "2-S", // Tipo de template para o e-mail do vendedor
        };

        // Payload para o e-mail do comprador
        const payloadBuyer = {
            productName: productName, // Verifica se o parâmetro existe
            storeName:   storeName, // Verifica se o parâmetro existe
            amountPaid: amountPaid,
            whatsappBuyer: whatsappBuyer,
            quantity: quantity,
            nameBuyer: nameBuyer,
            emailBuyer: emailBuyer, // E-mail do comprador
            adress: adress,
            timestamp: new Date().toISOString(),
            templateType: "3-B", // Tipo de template para o e-mail do comprador
            orderId: orderId
        };

        const payloadSaleNotification = {
            nameProduct: productName, // Verifica se o parâmetro existe
            originalAmount: amountPaid,
            namePayer: nameBuyer,
            emailSeller: emailSeller, // E-mail do comprador
            timestamp: new Date().toISOString(),
            templateType: "6-SALES-S", // Tipo de template para o e-mail do comprador
            paymentId: '000000000'
        };




        // Cálculo do valor pago com 6% deduzidos
        const paidAmount = (originalAmount * 0.94).toFixed(2);
        const paymentId = new Date().getTime().toString();
        const paymentData = {
            productId: productId,
            originalAmount: originalAmount,
            paidAmount: paidAmount,
            paymentNumber: phone,
            paymentName: paymentName,
            paymentEmail: paymentEmail,
            paymentWhatsapp: paymentWhatsapp,
            paymentMethod: paymentMethodDb,
            nome: nome,
            timestamp: new Date().toISOString()
        };

        console.log('Salvando pagamento no Firebase...');
        
        // Paraleliza as operações de salvamento
        const paymentPromises = [
            admin.database().ref(`users/${userId}/payments/${paymentId}`).set(paymentData),
            admin.database().ref(`users/${userId}/paymentsBackup/${paymentId}`).set(paymentData),
            admin.database().ref(`usersPaymentsBackup/${paymentId}`).set(paymentData)
        ];

        await Promise.all(paymentPromises); // Aguarda todas as promessas de pagamento serem concluídas

         // Enviar os dois e-mails em paralelo usando Promise.all
         const responses = await Promise.all([
            fetch('http://127.0.0.1:3001/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadSeller)
            }),
            fetch('http://127.0.0.1:3001/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadBuyer)
            }),
            fetch('http://127.0.0.1:3001/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadSaleNotification)
            })
        ]);


         // Aguarde as respostas e converta-as em JSON
         const data = await Promise.all(responses.map(response => response.json()));



        res.status(200).json({ message: 'Pagamento processado com sucesso', data: paymentResponse });
    } catch (error) {
        console.error('Erro ao processar o pagamento:', error.message);
        res.status(500).json({ message: 'Falha no processamento do pagamento', error: error.message });
    }
});











// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
