const express = require("express");
const admin = require("../../../../backend/config-db/firebase.js");
const axios = require("axios")
const bodyParser = require("body-parser");
const uuid = require("uuid");
const { updateBalance } = require("../../live/balance.js")
const { getDate } = require("../../../../backend/functions/index.js")
const { sendNotifications } = require("../../../../backend/functions/notifier.js")

const app = express();

// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());


const db = admin.database();






async function processPayment(amount, phoneNumber, trans_reference) {
    try {

        const requestData = {
            transReference: trans_reference,
            numberMpesa: phoneNumber,
            amount: amount,
        };

        const res = await axios.post('http://127.0.0.1:3020/api/v2/payment/mpesa/', requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': '*'
            }
        });

        if (res.status === 201 || res.status === 200) {
            console.log('Pagamento processado com sucesso:', res.data);
            return true;

        } else {
            console.log('Erro ao processar pagamento:', res.status, res.data);
            return false;
        }

    } catch (error) {
        console.log(error);
        return false

    }
}






let create_date = getDate();
let paymentId = new Date().getTime().toString(); // ID inicial (timestamp)

async function capturePayment(productData, customerMSISDN, buyerData) {
    const userId = productData?.userId;
    const pricePaid = productData?.price;
    const productId = productData?.productId;
    console.log(buyerData)

    try {

        // Cálculo do valor pago com 6% deduzidos
        const paidAmount = (pricePaid * 0.94).toFixed(2);


        const paymentData = {
            uniqueId: uuid.v4(),
            productId: productId || "N/A",
            originalAmount: pricePaid || "N/A",
            paidAmount: paidAmount || "N/A",
            paymentNumber: customerMSISDN || "N/A",
            paymentName: buyerData?.name || "N/A",
            paymentEmail: buyerData?.email || "N/A",
            paymentWhatsapp: buyerData?.contact || "N/A",
            paymentMethod: 'M-pesa',
            nome: productData?.name || "N/A",
            createAt: create_date || "N/A",
            timestamp: Date.now()  || "N/A", // UTC timestamp
        };




       let paymentRef = db.ref(`users/${userId}/payments/${paymentId}`);

        let tentativas = 0;
        const maxTentativas = 3; // Evitar loops infinitos

        while (tentativas < maxTentativas) {
            const snapshot = await paymentRef.once("value");

            // Se o ID NÃO existir, sai do loop e adiciona o pagamento
            if (!snapshot.exists()) break;

            // Se existir, gera um novo ID e tenta novamente
            paymentId = new Date().getTime().toString() + Math.floor(Math.random() * 1000);

            paymentRef = db.ref(`users/${userId}/payments/${paymentId}`);
            tentativas++;
        }

        if (tentativas >= maxTentativas) {
            console.log("Não foi possível gerar um ID único após várias tentativas.");
        }

        // 2. Se não existir, atualiza com o novo pagamento
        const updates = {};
        updates[`users/${userId}/payments/${paymentId}`] = paymentData;
        await db.ref().update(updates);
        console.log("Pagamaento criado com sucesso!")
        console.log('Atualizando o saldo')
        const update_response = await updateBalance(userId);
        console.log(update_response)
        return true

    } catch (error) {
        console.log(error)
        return false

    }


}









async function createPayment(productData, customerMSISDN) {
    const amount = productData.data.product.price;
    const transReference = productData.data.product.name;
    const userId = productData.data.product.userId;



    const payment_response = await processPayment(amount, customerMSISDN, transReference);

    if (payment_response === true) {
        const capture = await capturePayment(productData.data.product, customerMSISDN);

        if (capture === true) {
            return true
        } else {
            return false
        }

    } else {
        return false;
    }



}

app.post('/api/v2/payment/mpesa/capture/', async (req, res) => {
    const { customerMSISDN, productId, buyerData } = req.body;
    console.log("Dados recebidos : ", req.body)

    try {
        const productData = await axios.post('https://www.dropaymentsmz.online/api/v2/live/server', {
            productId: productId,
            reqType: 'product_data',
        });
        console.log(productData.data)
        const userId = productData.data.product.userId;

        const create_payment = await createPayment(productData, customerMSISDN, buyerData);

        if (create_payment === true) {

            const sendNot = await sendNotifications(buyerData, userId, 'M-pesa', paymentId, create_date, productData.data.product);

            if (sendNot === true) {
                return res.status(201).json({
                    success: 'true',
                    status_code: 201,
                    message: 'Payment create successfuly'
                });
            } else {

                return res.status(200).json({
                    success: 'true',
                    status_code: 200,
                    message: 'Fail when send payment notifications!'
                });
            }


        } else {
            return res.status(500).json({
                success: 'false',
                status_code: 500
            });
        }

    } catch (error) {

        console.log(error.message)
        return res.status(500).json({
            success: 'false',
            status_code: 500,
            error: error.message
        });

    }


});


app.get('/', (req, res) => {
    res.json('Run')
});





// Iniciar o servidor
const PORT = 3030;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
