const express = require("express");
const admin = require("firebase-admin");
const axios = require("axios")
const bodyParser = require("body-parser");
const uuid = require("uuid");

const app = express();

// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());



function sinitizeReference(reference) {
    reference = String(reference);
    const sanitized = reference.replace(/[^a-zA-Z0-9]/g, '');
    return sanitized.substring(0, 10);
}

function sanitizePhoneNumber(phoneNumber) {
    let sanitized = '';
    phoneNumber = String(phoneNumber);

    if (phoneNumber.startsWith('258')) {
        sanitized = phoneNumber.replace(/[^0-9]/g, '').substring(0, 12); // Remove caracteres não numéricos e limita a 12 dígitos
        return sanitized;
    }

    if (phoneNumber.length >= 9) {
        sanitized = phoneNumber.replace(/[^0-9]/g, '').substring(0, 9); // Remove caracteres não numéricos e limita a 12 dígitos
        return '258' + sanitized;
    }

}

function generateThirdPartyReference(transReference) {
    // Gera um ID de referência único com base no transReference
    const uniqueID2 = uuid.v4().replace(/[^a-zA-Z0-9]/g, '');
    const reference = transReference.substring(0, 4) + uniqueID2.substring(0, 9);
    return reference.replace(/[^a-zA-Z0-9]/g, '') // Gera um ID de referência único
}






// Rota para calcular e atualizar o saldon
app.post("/api/v2/payment/mpesa/", async (req, res) => {
    console.log("Dados recebidos:", req.body);
    const { amount, transReference, numberMpesa } = req.body;
    try {
        const trans_reference = sinitizeReference(transReference);
        const third_party_reference = generateThirdPartyReference(trans_reference)
        const sanitizedNumber = sanitizePhoneNumber(numberMpesa); // Sanitiza o número de telefone

        if (parseInt(amount) <= 0) {
            console.log("Valor deve ser maior que zero")
            return res.status(400).json({ message: 'O valor deve ser maior que zero.', code: 'INS-15' });
        }

        if (parseInt(amount) >= 45000) {
            console.log("Montante maximo excedido")
            return res.status(400).json({ message: 'Montante maximo excedido.', code: 'INS-15' });
        }


        const response = await axios.post('http://127.0.0.1:5000/api/v2/payment/mpesa/mpesa-payment-c2b', {
            input_TransactionReference: trans_reference,
            input_CustomerMSISDN: sanitizedNumber,
            input_Amount: amount,
            input_ThirdPartyReference: third_party_reference,
            input_ServiceProviderCode: '171717'
        });

        console.log("Resposta do servidor:", response.data);
        if (response.data.status_code === 201 || response.data.status_code === 200) {
            return res.status(201).json({
                message: 'Pagamento capturado e criado com sucesso',
                partner_output: response.data,
                status_code: 201
            });

        } else {
            console.log('ERRO DESCONHECIDO')
            return res.status(500).json({
                messgae: 'Erro desconhecido',
            });
        }

    } catch (error) {
        console.log(error.response.data)
        console.log('OCORREU UM ERRO NO SERVIDOR')
        return res.status(500).json({
            error: 'Ocorreu um erro no servidor.', code: error.response.data.output_ResponseCode, message: error.response.data.output_ResponseDesc
        });

    }


});

app.get('/', async (req, res) => {
    res.send('Run!');
}
);




// Iniciar o servidor
const PORT = 3020;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
