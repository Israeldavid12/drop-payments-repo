const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3020;


// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Middleware para processar JSON
app.use(bodyParser.json());

// Endpoint de callback
app.post('/api/emola-callback', (req, res) => {
    const { reqeustId, transId, refNo, errorCode, message } = req.body;

    console.log('Callback recebido do eMola:', req.body);

    // Validação básica dos parâmetros
    if (!reqeustId || !transId || !refNo || !errorCode || !message) {
        console.error('Dados inválidos recebidos no callback.');
        return res.status(400).json({
            ResponseCode: "1",
            ResponseMessage: "Dados inválidos"
        });
    }

    // Processa a lógica de negócios com base no errorCode
    if (errorCode === "0") {
        console.log(`Transação ${transId} confirmada com sucesso.`);
    } else {
        console.error(`Erro na transação ${transId}: ${message}`);
    }

    // Responde ao eMola
    res.status(200).json({
        ResponseCode: "0",
        ResponseMessage: "Callback processado com sucesso"
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor de callback eMola rodando na porta ${PORT}`);
});
