const express = require('express');
const bodyParser = require('body-parser');
const braintree = require('braintree');

// Configuração do Express
const app = express();
const port = 3000;

// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Configuração do Body Parser para receber dados JSON
app.use(bodyParser.json());

// Configuração do BrainTree usando o novo método
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox, // Usar Sandbox para teste
  merchantId: 'qp475rvv943f3nd4',             // Substitua com suas credenciais
  publicKey: '6y2dhz8x3gz2sb5c',               // Substitua com suas credenciais
  privateKey: '630e94c7875259a85add738757a306b8',
  debug: true // Ativa logs detalhados             // Substitua com suas credenciais
});

app.get('/api/client-token', (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    if (err) {
      console.error('Erro ao gerar client_token:', err);
      return res.status(500).send('Erro ao gerar token do cliente');
    }
    res.send(response.clientToken);
  });
});
  



// Endpoint para processar o pagamento
app.post('/api/process-payment', (req, res) => {
    console.log(req.body);
    const nonceFromTheClient = req.body.nonce;
  
    gateway.transaction.sale({
      amount: '164.00', // Substitua com o valor do pagamento
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true
      }
    }, (err, result) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
      } else {
        if (result.success) {
          res.send({ success: true });
        } else {
          res.status(400).send({ success: false, error: result.message });
        }
      }
    });
  });

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
