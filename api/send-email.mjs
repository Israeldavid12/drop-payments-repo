import 'dotenv/config'; // Carrega as variáveis de ambiente de um arquivo .env
import express from 'express';
import { createTransport } from 'nodemailer';
import pkg from 'body-parser';
import cors from 'cors';

const { json } = pkg;

const app = express();
const port = 3001;

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
    user: 'droppaymentsinc@gmail.com', // Seu e-mail do Gmail
    pass: 'xldaxfnloqgysvuq', // Sua senha de aplicativo do Gmail
  },
});

// Rota para enviar o e-mail via POST
app.post('/api/send-email', (req, res) => {
  console.log('Recebendo requisição:', req.body); // Log do corpo da requisição
  const {  namePayer, emailPayer, docUrl, nameProduct, storeName, productName,  amountPaid, quantity, timestamp, nameBuyer, emailBuyer, whatsappBuyer, templateType, adress, orderId, emailSeller, storeUrl, userId, paymentMethod, paymentNumber, paymentName, paymentId, originalAmount, otp_code, sender_email, fee, template, assunto } = req.body;

  // Validação básica dos parâmetros
  if (!templateType ) {
    return res.status(400).json({ message: 'Parâmetros inválidos. Verifique os dados enviados.' });
  }
  
  
  let htmlTemplate = '';
  let subject = '';
  let receiptEmail = '';

if (templateType === "2-S") {
  receiptEmail = emailSeller;
  subject = 'Novo pedido pago!';
  htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <title>Template</title>
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
            font-size: 18px;
            color: #333;
        }
        h3 span {
            padding: 0 5px;
            font-weight: bold;
        }
        p {
            font-size: 11px;
            color: #333;
        }
        p span {
            font-weight: 600;
            font-size: 11px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #07a544;
            color: #fff;
            border-radius: 5px;
            margin-top: 20px;
            text-decoration: none;
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
            font-size: 7px;
            height: 25px;
            color: #fff;
            background-color: #1f395e;
            padding: 10px;
            text-align: center;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table td {
            padding: 10px 20px;
            text-align: left;
            vertical-align: top;
            font-size: 11px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .table th {
            text-align: left;
            font-weight: bold;
            padding: 10px 20px;
            background-color: #062858;
            color: white;
            border: 1px solid #ddd;
        }
        .table td:first-child {
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <img id="back-button" src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="DP logo" class="logo">
    </div>
    <div class="container">
        <h3>Novo pedido <span style="color: #07a544;">pago</span> da loja ${storeName}!</h3>

        <table class="table">
            <tr>
                <td>Nome do produto</td>
                <td>${productName}</td>
            </tr>
            <tr>
                <td>Total pago</td>
                <td>${amountPaid}</td>
            </tr>
            <tr>
                <td>Quantidade de itens</td>
                <td>${quantity}</td>
            </tr>
            <tr>
                <td>Data</td>
                <td>${timestamp}</td>
            </tr>
        </table>

        <p style="font-weight: 600; font-size: 14px;">Informações do comprador:</p>
        
        <table class="table">
            <tr>
                <td>Nome</td>
                <td>${nameBuyer}</td>
            </tr>
            <tr>
                <td>Email</td>
                <td>${emailBuyer}</td>
            </tr>
            <tr>
                <td>Whatsapp</td>
                <td>${whatsappBuyer}</td>
            </tr>
            <tr>
                <td>Endereço</td>
                <td>${adress}</td>
            </tr>
        </table>

        <a href="https://www.dropaymentsmz.online/vendas" style="color: #fff" class="button">Ver mais detalhes</a>

        <div class="signature">
            <p>Atenciosamente,<br>Equipe Drop Payments</p>
        </div>

        <div class="footer">
            Drop Payments Mz – Todos direitos Reservados - 2024
        </div>
    </div>
</body>
</html>
`; } else if (templateType === '1-B')  {
  receiptEmail =  emailPayer;
  subject = 'Seu Produto está pronto!';
   
   // Template HTML para o e-mail
 htmlTemplate = `<!DOCTYPE html>
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
             height: 50px;
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
             
         h1 {
             font-size: 21px;
             color: #333;
         }
         h1 span {
           
             padding: 0 5px;
             font-weight: bold;
         }
         p {
             font-size: 16px;
             color: #333;
         }
         p span {
             font-weight: 600;
             font-size: 16px;
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
        <img id="back-button" src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="DP logo" class="logo">
     </div>
     <div class="container">
         <h1>Olá, <span>${namePayer}</span>!</h1>
         <p>Obrigado pela sua compra. </p>
         <p>Parabens você tem agora acesso ao produto <span>${nameProduct}</span>!</p>
         <a href="${docUrl}" class="button">Acessar o conteudo</a>
         
         <div class="signature">
             <p>Atenciosamente,<br>Equipe Drop Payments</p>
             <p></p>
             <p style="font-size: 14px;" >Se precisar de ajuda para Acessar o produto.</p>
             <a id="suporte" href="https://api.whatsapp.com/send?phone=258863814050">Clique aqui</a>
         </div>
         <div class="footer">
             Drop Payments Mz – Todos direitos Reservados - 2024
         </div>
     </div>
   
 </body>
 </html>
`;
   
   
}  else if (templateType === '3-B')  {
    receiptEmail =  emailBuyer;
    subject = 'Seu pedido foi recebido com sucesso!';
     
     // Template HTML para o e-mail
   htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <title>Template</title>
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
            font-size: 18px;
            color: #333;
        }
        h3 span {
            padding: 0 5px;
            font-weight: bold;
        }
        p {
            font-size: 11px;
            color: #333;
        }
        p span {
            font-weight: 600;
            font-size: 11px;
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
            font-size: 6px;
            height: 25px;
            color: #fff;
            background-color: #1f395e;
            padding: 10px;
            text-align: center;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table td {
            padding: 10px 20px;
            text-align: left;
            vertical-align: top;
            font-size: 11px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .table th {
            text-align: left;
            font-weight: bold;
            padding: 10px 20px;
            background-color: #062858;
            color: white;
            border: 1px solid #ddd;
        }
        .table td:first-child {
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <img id="back-button" src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="DP logo" class="logo">
    </div>
    <div class="container">
        <h3>Olá <span>${nameBuyer}</span> seu pedido # <span>${orderId}</span> para a loja "${storeName}" foi<span style="color: #07a544;"> concluido</span> com sucesso!</h3>

        <table class="table">
            <tr>
                <td>Nome do produto</td>
                <td>${productName}</td>
            </tr>
            <tr>
                <td>Total pago</td>
                <td>${amountPaid}</td>
            </tr>
            <tr>
                <td>Quantidade de itens</td>
                <td>${quantity}</td>
            </tr>
            <tr>
                <td>Data</td>
                <td>${timestamp}</td>
            </tr>
        </table>

        <p style="font-weight: 600; font-size: 14px;">Informações do comprador:</p>
        
        <table class="table">
            <tr>
                <td>Nome</td>
                <td>${nameBuyer}</td>
            </tr>
            <tr>
                <td>Email</td>
                <td>${emailBuyer}</td>
            </tr>
            <tr>
                <td>Whatsapp</td>
                <td>${whatsappBuyer}</td>
            </tr>
            <tr>
                <td>Endereço</td>
                <td>${adress}</td>
            </tr>
        </table>

        <div class="signature">
            <p>Atenciosamente,<br>Equipe Drop Payments</p>
        </div>

        <div class="footer">
            Drop Payments – Todos direitos Reservados - 2024
        </div>
    </div>
</body>
</html>
  `;
     
     
  } else if (templateType === '4-S')  {
    receiptEmail =  "israeldavide35@gmail.com";
    subject = 'Novo pedido de integração com Shopify recebida!';
     
     // Template HTML para o e-mail
   htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <title>Template</title>
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
            font-size: 18px;
            color: #333;
        }
        h3 span {
            padding: 0 5px;
            font-weight: bold;
        }
        p {
            font-size: 11px;
            color: #333;
        }
        p span {
            font-weight: 600;
            font-size: 11px;
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
            font-size: 6px;
            height: 25px;
            color: #fff;
            background-color: #1f395e;
            padding: 10px;
            text-align: center;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .table td {
            padding: 10px 20px;
            text-align: left;
            vertical-align: top;
            font-size: 11px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .table th {
            text-align: left;
            font-weight: bold;
            padding: 10px 20px;
            background-color: #062858;
            color: white;
            border: 1px solid #ddd;
        }
        .table td:first-child {
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <img id="back-button" src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="DP logo" class="logo">
    </div>
    <div class="container">
        <h3>Novo pedido de integração com Shopify recebida!</h3>

        <table class="table">
            <tr>
                <td>ID do cliente</td>
                <td>${userId}</td>
            </tr>
            <tr>
                <td>Whatsapp</td>
                <td>${whatsappBuyer}</td>
            </tr>
            <tr>
                <td>Nome da loja</td>
                <td>${storeName}</td>
            </tr>
            <tr>
                <td>Link da loja </td>
                <td>${storeUrl}</td>
            </tr>
        
            <tr>
                <td>E-mail do usuario</td>
                <td>${emailSeller}</td>
            </tr>
            <tr>
                <td>Data</td>
                <td>${timestamp}</td>
            </tr>
        </table>

        <div class="signature">
            <p>Atenciosamente,<br>Equipe Drop Payments</p>
        </div>

        <div class="footer">
            Drop Payments – Todos direitos Reservados - 2024
        </div>
    </div>
</body>
</html>
`
  }  else if (templateType === '5-W')  {
    receiptEmail =  emailSeller;
    subject = 'Novo saque solicitado!';
     
     // Template HTML para o e-mail
   htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <title>Template</title>
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
            font-size: 17px;
            color: #333;
        }
        h3 span {
            padding: 0 5px;
            font-weight: bold;
        }
        p {
            font-size: 11px;
            color: #333;
        }
        p span {
            font-weight: 600;
            font-size: 11px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #0056b3;
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #0978ee;
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
            margin: 0 auto;
            max-width: 600px;
        }
        .table-container {
            max-width: 600px;
            padding: 10px;
        }
        .table {
            border-collapse: collapse;
            margin-top: 20px;
            width: 100%;
        }
        .table td {
            padding: 10px 20px;
            text-align: left;
            vertical-align: top;
            color: #3d3d3d;
            font-size: 14px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .table th {
            text-align: left;
            font-weight: bold;
            padding: 10px 20px;
            background-color: #062858;
            color: white;
            border: 1px solid #ddd;
        }
        .table td:first-child {
            font-weight: bold;
            color: #333;
            
        }
        .titulo {
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="header">
        <img id="back-button" src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="DP logo" class="logo">
    </div>
    <div class="container">
        <h3>Novo<span style="color: #07a544;">saque</span>solicitado!</h3>

      <div class="table-container" >
        <table class="table">
            <tr>
                <td class="titulo"  >Total solicitado</td>
                <td>${amountPaid} MT </td>
            </tr>
            <tr>
                <td class="titulo" >Valor a receber</td>
                <td>${amountPaid - (amountPaid * 0.08)} MT</td>
            </tr>
            <tr>
                <td class="titulo" >Conta solicitante</td>
                <td  >${emailSeller}</td>
            </tr>
            <tr>
                <td class="titulo" >M. de pagamento</td>
                <td>${paymentMethod}</td>
            </tr>
              <tr>
                <td class="titulo" >Titular</td>
                <td>${paymentName}</td>
            </tr>
             <tr>
                <td class="titulo" >Numero</td>
                <td>${paymentNumber}</td>
            </tr>
            <tr>
                <td class="titulo" >Data</td>
                <td>${timestamp}</td>
            </tr>
        </table>

      </div>
        <a href="https://www.dropaymentsmz.online/saques" class="button">Ver mais detalhes</a>

        <div class="signature">
            <p>Atenciosamente,<br>Equipe Drop Payments</p>
        </div>

        
    </div>
    <div class="footer">
        Drop Payments Mz – Todos direitos Reservados - 2024
    </div>
</body>
</html>
`
  }  else if (templateType === '5-W-Admin')  {
    receiptEmail =  "israeldavide35@gmail.com";
    subject = 'Novo saque solicitado!'; 
     
     // Template HTML para o e-mail
   htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <title>Template</title>
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
            font-size: 17px;
            color: #333;
        }
        h3 span {
            padding: 0 5px;
            font-weight: bold;
        }
        p {
            font-size: 11px;
            color: #333;
        }
        p span {
            font-weight: 600;
            font-size: 11px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #0056b3;
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #0978ee;
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
            margin: 0 auto;
            max-width: 600px;
        }
        .table-container {
            max-width: 600px;
            padding: 10px;
        }
        .table {
            border-collapse: collapse;
            margin-top: 20px;
            width: 100%;
        }
        .table td {
            padding: 10px 20px;
            text-align: left;
            vertical-align: top;
            color: #3d3d3d;
            font-size: 14px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .table th {
            text-align: left;
            font-weight: bold;
            padding: 10px 20px;
            background-color: #062858;
            color: white;
            border: 1px solid #ddd;
        }
        .table td:first-child {
            font-weight: bold;
            color: #333;
            
        }
        .titulo {
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="header">
        <img id="back-button" src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="DP logo" class="logo">
    </div>
    <div class="container">
        <h3>Novo<span style="color: #07a544;">saque</span>solicitado!</h3>

      <div class="table-container" >
        <table class="table">
            <tr>
                <td class="titulo"  >Total solicitado</td>
                <td>${amountPaid} MT</td>
            </tr>
            <tr>
                <td class="titulo" >Valor a receber</td>
                <td>${amountPaid - (amountPaid * 0.08)} MT</td>
            </tr>
            <tr>
                <td class="titulo" >Conta solicitante</td>
                <td  >${emailSeller}</td>
            </tr>
            <tr>
                <td class="titulo" >M. de pagamento</td>
                <td>${paymentMethod}</td>
            </tr>
             <tr>
                <td class="titulo" >Titular</td>
                <td>${paymentName}</td>
            </tr>
             <tr>
                <td class="titulo" >Numero</td>
                <td>${paymentNumber}</td>
            </tr>
             <tr>
                <td class="titulo" >ID do saque</td>
                <td>${paymentId}</td>
            </tr>
            <tr>
                <td class="titulo" >Data</td>
                <td>${timestamp}</td>
            </tr>
        </table>

      </div>
        <a style="color: white" href="https://www.dropaymentsmz.online/saque/confirm.html?userId=${userId}&paymentId=${paymentId}&amountPaid=${amountPaid}&emailSeller=${emailSeller}&paymentMethod=${paymentMethod}" class="button">Confirmar pagamento</a>

        <div class="signature">
            <p>Atenciosamente,<br>Equipe Drop Payments</p>
        </div>
        
    </div>
    <div class="footer">
        Drop Payments Mz – Todos direitos Reservados - 2024
    </div>
</body>
</html>
`
  }   else if (templateType === '6-SALES-S')  {
    receiptEmail =  emailSeller;
    subject = 'Venda efetuada com sucesso!'; 
     
     // Template HTML para o e-mail
   htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
    </style>
  <style>
    body {
      font-family: "Poppins", serif;
      background-color: #f5f5f5;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #062858;
      color: #ffffff;
      padding: 20px;
      text-align: start;
    }
    .header img {
      max-height: 40px;
    }
    .content {
      padding: 20px;
    }
    .content h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .content p {
      font-size: 16px;
      margin: 5px 0;
    }
    .data-box {
      background-color: #f9f9f9;
      padding: 15px;
      border-left: 5px solid #0055b3;
      margin: 20px 0;
    }
    .data-box p {
      font-size: 16px;
    }
    .data-box .highlight {
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #777;
    }
    .footer a {
      color: #0055b3;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="Hotmart">
    </div>
    <div class="content">
      <h4>Parabéns! Você acabou de realizar uma venda do produto <span style="color: rgb(20, 139, 20);" >${nameProduct}!</span> <i class="fa fa-check-circle" aria-hidden="true"></i>   </h4>
      <hr>
      <p style="text-align: center;" >Você recebeu:</p>
      <p style="font-weight: 600; font-size: 18px; color: rgb(20, 139, 20); text-align: center;" class="highlight">MZN ${originalAmount}</p>
      <div class="data-box">
        <p><span class="highlight">DADO DA TRANSAÇÃO:</span></p>
        <p><strong>Nome:</strong> ${namePayer}</p>
        <p><strong>Email:</strong>${emailPayer}</p>
        <p><strong>Transação:</strong> ${paymentId} </p>
        <p><strong>Total Pago:</strong> ${originalAmount} </p>
        <p><strong>Data de Pagamento da Compra:</strong> ${timestamp} </p>
      </div>
      
      <div class="footer">
        <p>Para mais informações sobre a venda, <a href="https://www.dropaymentsmz.online/vendas">Clique aqui</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`
  }   else if (templateType === '7-OTP-CODE')  {
    receiptEmail =  emailSeller;
    subject = 'Seu codigo OTP para confirmacao da transferencia!'; 
     
     // Template HTML para o e-mail
   htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
    </style>
  <style>
    body {
      font-family: "Poppins", serif;
      background-color: #f5f5f5;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #062858;
      color: #ffffff;
      padding: 20px;
      text-align: start;
    }
    .header img {
      max-height: 40px;
    }
    .content {
      padding: 20px;
    }
    .content h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .content p {
      font-size: 16px;
      margin: 5px 0;
    }
    .data-box {
      background-color: #f9f9f9;
      padding: 15px;
      border-left: 5px solid #0055b3;
      margin: 20px 0;
    }
    .data-box p {
      font-size: 16px;
    }
    .data-box .highlight {
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #777;
    }
    .footer a {
      color: #0055b3;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="Hotmart">
    </div>
    <div class="content">
      <h4>Olá, o seu codigo de confirmação para conclusao da transferencia é: ${otp_code}  </h4>
      <hr>
      <p style="text-align: center;" >Codigo de confirmação:</p>
      <p style="font-weight: 600; font-size: 18px; color: rgb(30, 30, 31); text-align: center; border: 1px solid rgb(13, 65, 133); padding: 12px; border-radius: 8px; background-color: #d0e4fa;" class="highlight">${otp_code}</p>
     
      
      <div class="footer">
        <p>Atenciosamente,<br>Equipe Drop Payments</p>
        <p>Para mais informações sobre a venda, <a href="https://www.dropaymentsmz.online/vendas">Clique aqui</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`
  }   else if (templateType === '8-P-R')  {
    receiptEmail =  emailSeller;
    subject = 'Recebeu dinheiro!'; 
     
     // Template HTML para o e-mail
   htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
    </style>
  <style>
    body {
      font-family: "Poppins", serif;
      background-color: #f5f5f5;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #062858;
      color: #ffffff;
      padding: 20px;
      text-align: start;
    }
    .header img {
      max-height: 40px;
    }
    .content {
      padding: 20px;
    }
    .content h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .content p {
      font-size: 16px;
      margin: 5px 0;
    }
    .data-box {
      background-color: #f9f9f9;
      padding: 15px;
      border-left: 5px solid #0055b3;
      margin: 20px 0;
    }
    .data-box p {
      font-size: 16px;
    }
    .data-box .highlight {
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #777;
    }
    .footer a {
      color: #0055b3;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="Hotmart">
    </div>
    <div class="content">
      <h4>Recebeu dinheiro de ${sender_email}</span> <i class="fa fa-check-circle" aria-hidden="true"></i>   </h4>
      <hr>
      <p style="text-align: center;" >Você recebeu:</p>
      <p style="font-weight: 600; font-size: 18px; color: rgb(25, 25, 26); text-align: center;" class="highlight">MZN ${amountPaid}</p>
      <div class="data-box">
        <p><span class="highlight">DADO DA TRANSAÇÃO:</span></p>
        <p><strong>Email:</strong>${sender_email}</p>
        <p><strong>Transação:</strong> ${paymentId} </p>
        <p><strong>Total Pago:</strong> ${originalAmount} </p>
        <p><strong>Fee:</strong> ${fee}</p>
        <p><strong>Data de Pagamento da Compra:</strong> ${timestamp} </p>
      </div>
      
      <div class="footer">
        <p>Para mais informações sobre a venda, <a href="https://www.dropaymentsmz.online/vendas">Clique aqui</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`
  }   else if (templateType === '9-C-S')  {
    receiptEmail =  emailSeller;
    subject = 'Atualizacao da sua solicitacao!'; 
     
     // Template HTML para o e-mail
   htmlTemplate = `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <title>Template</title>
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
            font-size: 16px;
            color: #333;
        }
        h3 span {
            padding: 0 5px;
            font-weight: bold;
        }
        p {
            font-size: 11px;
            color: #333;
        }
        p span {
            font-weight: 600;
            font-size: 11px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #0056b3;
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #0978ee;
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
            margin: 0 auto;
            max-width: 600px;
        }
        .table-container {
            max-width: 600px;
            padding: 10px;
        }
        .table {
            border-collapse: collapse;
            margin-top: 20px;
            width: 100%;
        }
        .table td {
            padding: 10px 20px;
            text-align: left;
            vertical-align: top;
            color: #3d3d3d;
            font-size: 14px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
        }
        .table th {
            text-align: left;
            font-weight: bold;
            padding: 10px 20px;
            background-color: #062858;
            color: white;
            border: 1px solid #ddd;
        }
        .table td:first-child {
            font-weight: bold;
            color: #333;
            
        }
        .titulo {
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="header">
        <img id="back-button" src="https://i.postimg.cc/gj1psQ1c/Design-sem-nome-68.png" alt="DP logo" class="logo">
    </div>
    <div class="container">
        <h3>Saque<span style="color: #07a544;">${paymentId}</span>pago com sucesso!</h3>

      <div class="table-container" >
        <table class="table">
            <tr>
                <td class="titulo"  >Total solicitado</td>
                <td>${amountPaid} MT</td>
            </tr>
            <tr>
                <td class="titulo" >Total pago</td>
                <td>${(amountPaid - (amountPaid * 0.08)) - 10 } MT</td>
            </tr>
            <tr>
                <td class="titulo" >Conta solicitante</td>
                <td  >${emailSeller}</td>
            </tr>
            <tr>
                <td class="titulo" >M. de pagamento</td>
                <td>${paymentMethod}</td>
            </tr>
            <tr>
                <td class="titulo" >Data</td>
                <td>${timestamp}</td>
            </tr>
        </table>

      </div>
        <a href="https://www.dropaymentsmz.online/saques" class="button">Ver mais detalhes</a>

        <div class="signature">
            <p>Atenciosamente,<br>Equipe Drop Payments</p>
        </div>

        
    </div>
    <div class="footer">
        Drop Payments E.I – Todos direitos Reservados
    </div>
    <script>
        console.log((100 - (100 * 0.08)) - 10);
    </script>
</body>
</html>
`
  }  else if (templateType === '10-P-E') {
    receiptEmail = emailSeller;
    subject = assunto;
    htmlTemplate = template;
  }
  
  
  
  
  


















 

  // Opções do e-mail
  const mailOptions = {
    from: 'droppaymentsinc@gmail.com', // Email remetente
    to: receiptEmail, // Email do destinatário, vindo do body da requisição
    subject: subject,
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
