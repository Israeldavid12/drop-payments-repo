const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');
const admin = require('firebase-admin');
const axios = require("axios");
require('dotenv').config();
const { captureOrder, createOrder } = require('./functions/index.js')








// Função para inicializar o Firebase
const serviceAccount = require("../../../.././credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json"); // Substitua pelo seu arquivo de credenciais

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app", // Substitua pela URL do seu banco de dados
}); 

const db = admin.database();



// Criar servidor Express
const app = express();
app.use(bodyParser.json());



// Configuração de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});







async function exchangePrice(cart) {


  if (cart.currencyCode === "MZ") {
    let bidUSD = '';
    try {
      const data = await axios.get("https://economia.awesomeapi.com.br/json/last/USD-MZN")
      const bid = data.data.USDMZN.bid;  // Obtém a cotação 'bid'
      console.log(data)
      bidUSD = bid;

    } catch (error) {
      console.log(error)
      bidUSD = '63.20';

    }
    console.log(bidUSD)
    const exchanged_price = parseFloat((cart.price / bidUSD).toFixed(2))
    console.log(exchanged_price)
    return exchanged_price

  }


  if (cart.currencyCode === "BR") {

    let price_in_brl = 0
    bidBRL = ""

    try {
      const exchange = await axios.post("http://127.0.0.1:3013/api/v2/live/server", {
        reqType: "exchange",
        exchange_type: "MZN-BRL",
        price: 2
      })
      bidBRL = exchange.data.cot;
      console.log("CAMBIO : ", bidBRL)


    } catch (error) {
      console.log(error)
      bidBRL = '11.08';

    }

    price_in_brl = parseFloat((cart.price / bidBRL))
    console.log("price in brl : ", price_in_brl)
    let bidUSD_BRL = 0

    try {

      const usd = await axios.get("https://economia.awesomeapi.com.br/json/last/USD-BRL")
      console.log(usd.data)
      const bid = usd.data.USDBRL.bid;  // Obtém a cotação 'bid'
      bidUSD_BRL = bid


    } catch (error) {
      console.log(error)
      bidUSD_BRL = 6

    }



    console.log(bidUSD)
    const exchanged_price = parseFloat((price_in_brl / bidUSD_BRL).toFixed(2))
    console.log(exchanged_price)
    return exchanged_price

  }


  if (cart.currencyCode === "USA") {
    let bid_USD = "";
    try {
      const data = await axios.get("https://economia.awesomeapi.com.br/json/last/USD-MZN")
      const bid = data.USDMZN.bid;  // Obtém a cotação 'bid'
      bid_USD = bid;

    } catch (error) {
      bid_USD = '63.20';

    }
    return parseFloat((cart.price / bid_USD).toFixed(2))
  }


}

let bid_usd = 0
async function exchangePriceToUsd(amount) {
  try {
    const bid_usd_req = await axios.get("https://economia.awesomeapi.com.br/json/last/USD-MZN")
    const bid = bid_usd_req.data.USDMZN.bid;  // Obtém a cotação 'bid'
    bid_usd = bid;
    console.log("COTACAO DO DOLAR DA API: ", bid_usd)
  } catch (error) {
    console.log(error)
    bid_usd = 63.20;
  }

  const exchanged_price = parseFloat((amount * bid_usd).toFixed(2))
  console.log(exchanged_price)
  return Number(exchanged_price)

}


app.post("/api/v2/payment/paypal", async (req, res) => {
  const { reqType } = req.body;
  // console.log(req.body)
 

  if (reqType === "save_paypal_payment") {
    const { transData, productData, buyerData } = req.body;

    console.log("CPTURE PAYMENT REQ BODY : ", req.body)
    console.log("CAMPOS COLETADOS : ", buyerData)
    try {


      const transaction = transData?.purchase_units?.[0]?.payments?.captures?.[0] ||
        transData?.purchase_units?.[0]?.payments?.authorizations?.[0];
      console.log(transaction)


      const netAmount = transaction?.seller_receivable_breakdown?.net_amount?.value || 0; // Valor líquido

      console.log(netAmount)
      const grossAmount = transaction?.amount?.value; // Valor total pago
      const feeAmount = transData?.seller_receivable_breakdown?.paypal_fee?.value || 0; // Taxa do PayPal
      const paypal_payment_id = transaction?.id;
      console.log(netAmount, grossAmount, feeAmount, paypal_payment_id)
      const meticalNetAmount = await exchangePriceToUsd(Number(netAmount));
      const MeticalfeeAmount = await exchangePriceToUsd(Number(feeAmount));
      const MeticalGrossAmount = await exchangePriceToUsd(Number(grossAmount));
      const currency = transaction?.amount.currency_code;
      console.log("currency code : ", currency)

      const userId = productData.userId;

      const paymentIdDB = new Date().getTime().toString();

      const paymentData = {
        productId: productData.productId,

        orderId: paypal_payment_id || "N/A",
        originalAmount: meticalNetAmount,
        feeAmount: MeticalfeeAmount || "N/A",
        paidAmount: MeticalGrossAmount || "N/A",
        paymentName: buyerData?.Nome || "N/A",
        paymentEmail: buyerData?.Email || "N/A",
        paymentMethod: 'PayPal',
        status: 'approved',
        description: transaction?.description || "N/A",
        currency: currency || "N/A",
        nome: productData.name || "N/A",
        timestamp: new Date().toISOString() || "N/A",

      };

      await db.ref(`users/${userId}/payments/${paymentIdDB}`).set(paymentData)
      console.log("Pagamaento criado com sucesso!")
      const salesUserRef = db.ref(`users/${userId}/payments`);
      try {
        let userEmail = "";

        const sellerEmailRef = db.ref(`users/${userId}/email`);
        const snapshotEmail = await sellerEmailRef.once('value')
        const email = snapshotEmail.val()
        userEmail = email;

        if (!email) {
          console.log('Email não encontrado para o usuário.');
          userEmail = 'usernotfound@gmail.com';
        } else {
          console.log('Email do usuário recuperado:', userEmail);
        }

        const timestamp = new Date().toISOString();

        const sellerPayload = { //payload paran o vendedor
          nameProduct: productData?.name || "N/A",
          originalAmount: meticalNetAmount,
          namePayer: buyerData?.Nome || "N/A",
          emailPayer: buyerData?.Email || "N/A",
          emailSeller: userEmail, // E-mail do vendedor
          timestamp: timestamp,
          templateType: "6-SALES-S", // Tipo de template para o e-mail do vendedor
          paymentId: paymentIdDB,

        }


        const payerPayload = { // payload para o comprador
          paymentMethod: "paypal",
          namePayer: buyerData?.Nome || "N/A",
          emailPayer: buyerData?.Email || "N/A",
          nameProduct: productData?.name || "N/A",
          docUrl: productData?.docUrl,
          templateType: "1-B",
          paymentId: paymentIdDB,
          originalAmount: meticalNetAmount,
          timestamp: timestamp
        }
        const email_endpoint = "http://127.0.0.1:3002/api/v2/smtp/send-email";

        const responses = await Promise.all([
          axios.post(email_endpoint, sellerPayload),
          axios.post(email_endpoint, payerPayload),
        ]);
        // Aguarde as respostas
        const data = responses.map(response => response.data);
        console.log(data)


      } catch (error) {
        console.log(error);
      }



      return res.status(201).json({ estado: "completado", code: "0", payer_email: buyerData.Email })


    } catch (error) {
      console.log(error)
      console.log("Ocorreu um erro ao salvar o pagamento!");
      res.status(500).json({code: "E-10"})
    }

  }


  if (reqType === '/api/orders') {
    const { cart } = req.body;
    try {
      // use the cart information passed from the front-end to calculate the order amount detals


      const price = await exchangePrice(cart);
      const { jsonResponse, httpStatusCode } = await createOrder(String(price));
      console.log("PEDIDO CRIADO COM SUCESSO")
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order.", error_datails: error });
    }
  }


  if (reqType === "/api/orders/:orderID/capture") {
    try {
      const { productData, orderID, buyerData } = req.body;
      console.log("/api/orders/:orderID/capture", req.body)
      console.log("ORDER ID : ", orderID)
      // console.log(data)
      const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

      const transData = jsonResponse;
      console.log("1", httpStatusCode)
      const save_payment = await axios.post("http://127.0.0.1:3010/api/v2/payment/paypal", {
        reqType: "save_paypal_payment",
        productData: productData,
        transData: transData,
        buyerData: buyerData,
      });
      console.log("save payment response : ", save_payment.data)
      if (save_payment.data) {
        if (save_payment.data.code === "0") {
          res.status(httpStatusCode).json(transData)
        }
      }
     

    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  }



});





// Iniciar o servidor
const port = 3010;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});