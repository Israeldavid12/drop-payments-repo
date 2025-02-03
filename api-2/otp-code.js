const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');



const app = express();


// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());


app.post('/api/otp-code', async (req, res) => {
    const { type_code, email } = req.body;
    console.log(type_code);

    if (!type_code) {
        return res.status(400).json({ error: 'tipo invalido!' });
    }

    try {

        // Gerar um número de 6 dígitos aleatórios
        const randomSixDigitNumber = () => {
            return Math.floor(100000 + Math.random() * 900000);
        };


        const otp = randomSixDigitNumber();
        console.log(otp);
        const otpEmailPayload = {
           otp_code: otp,
           emailSeller: email,
           templateType: '7-OTP-CODE'
        }

        await axios.post('https://www.dropaymentsmz.online/api/send-email', otpEmailPayload);

        return res.status(200).json({ otp: `${otp}` });


    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error interno do servidor!' });
    }


});









// Iniciar o servidor
const PORT = 3013;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});