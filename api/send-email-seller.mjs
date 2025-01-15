import 'dotenv/config'; // Carrega as variáveis de ambiente de um arquivo .env
import express from 'express';
import { createTransport } from 'nodemailer';
import pkg from 'body-parser';
import cors from 'cors';

const { json } = pkg;

const app = express();
const port = 3002;

// Permite requisições CORS de qualquer origem
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permite todas as origens
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE"); // Métodos permitidos
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // Cabeçalhos permitidos
  next(); // Continua para o próximo middleware
});

app.use(json()); // Middleware para permitir parsing de JSON no corpo das requisições POST

// Configuração do Gmail como servidor SMTP
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: 'seller.dropaymets.inc@gmail.com', // Seu e-mail do Gmail
    pass: 'kvbszorspzaptuwr', // Sua senha de aplicativo do Gmail
  },
});





//Rota de envio de email para o vendedor
app.post('/api/send-email-seller', (req, res) => {
  console.log('Recebendo requisição:', req.body); // Log do corpo da requisição
  const {  namePayer, emailPayer, docUrl, nameProduct, storeName, productName,  amountPaid, quantity, timestamp, nameBuyer, emailBuyer, whatsappBuyer} = req.body;

  // Validação básica dos parâmetros
  if (!nameBuyer || !emailBuyer || !storeName || !productName || !amountPaid || !whatsappBuyer ||!timestamp  || !quantity  ) {
    return res.status(400).json({ message: 'Parâmetros inválidos. Verifique os dados enviados.' });
  }

  // Template HTML para o e-mail
  const htmlTemplate = `<!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
        <title>E-mail com Link para PDF</title>
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                background-color: #f9f9f9;
                
            }
            .header {
                background-color: #062858;
                padding: 20px;
                border-radius: 5px;
                max-width: 600px;
                height: 35px;
                margin: 0 auto;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header img {
               width: 35px;
               height: 35px;
            }
            .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h3 {
                font-size: 21px;
                color: #333;
            }
            h3 span {
              
                padding: 0 5px;
                font-weight: bold;
            }
            p {
                font-size: 14px;
                color: #333;
            }
            p span {
                font-weight: 600;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #07a544;
                color: #fff;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
            .button:hover {
                background-color: #0056b3;
                color: #fff;
            }
            .signature {
                margin-top: 40px;
                font-size: 14px;
                color: #333;
            }
            #suporte {
        text-decoration: underline;
        font-size: 12px;
        color: #333;
    }
    .footer {
        margin-top: 10px;
        font-size: 9px;
        height: 25px;
        color: #fff;
        background-color: #1f395e;
        padding: 10px;
        text-align: center;
       
    }
        </style>
    </head>
    <body>
        <div class="header" >
           <img id="back-button" src="https://i.ibb.co/D455cWM/Design-sem-nome-67.png" alt="DP logo" class="logo">
        </div>
        <div class="container">
            <h3>Novo pedido <span style="color: #07a544;" >pago</span> da loja ${storeName}</span>!</h3>
            <p>Nome do produto: <span>${productName} </span></p>
            <p>Total pago: <span>${ amountPaid}</span></p>
            <p>Quantidade de items: <span>${quantity}</span></p>
            <p>Data: <span>${timestamp}</span></p>

            <p style="font-weight: 600; font-size: 16px;" >Informacoes do comprador: </p>
            <p>Nome: <span>${nameBuyer}</span></p>
            <p>Email: <span>${emailBuyer}</span></p>
            <p>Whatsapp: <span>${whatsappBuyer}</span></p>
            <a href="https://www.dropaymentsmz.online/vendas" class="button">Ver mais detalhes</a>
            
            <div class="signature">
                <p>Atenticiosamente<br>Equipe Drop Payments</p>
                <p></p>
               
            </div>
            <div class="footer">
                Drop Payments Mz – Todos direitos Reservados - 2024
            </div>
        </div>
      
    </body>
    </html>
  `;

  // Opções do e-mail
  const mailOptions = {
    from: 'seller.dropaymets.inc@gmail.com', // Email remetente
    to: "josekmk3@gmail.com", // Email do destinatário, vindo do body da requisição
    subject: 'Novo pedido pago!',
    html: htmlTemplate, // O conteúdo HTML do e-mail
  };

  // Envia o e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro na requisição:', error);
      return res.status(500).json({ message: 'Erro na requisição', error: error.message });
    } else {
      console.log('E-mail enviado: ' + info.response);
      res.json({ message: 'E-mail enviado com sucesso!', info: info.response });
    }
  });
});



















// Rota raiz
app.get('/', (req, res) => {
  res.send('Servidor funcionando!'); // Mensagem simples
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
