const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('paypal-rest-sdk');
const admin = require('firebase-admin');
require('dotenv').config();
const {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController
} = require("@paypal/paypal-server-sdk");
const { default: axios } = require('axios');






const client_id = process.env.PAYPAL_CLIENT_ID_2;
const client_secret = process.env.PAYPAL_CLIENT_SECRET_2;


const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: client_id,
    oAuthClientSecret: client_secret,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});
const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);


// Função para inicializar o Firebase
const serviceAccount = require("../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json"); // Substitua pelo seu arquivo de credenciais

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app", // Substitua pela URL do seu banco de dados
});

const db = admin.database();



// Criar servidor Express
const app = express();
app.use(bodyParser.json());

let payerEmail = '';
let payerName = '';

// Configuração de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


//CRIAR PEDIDO

const createOrder = async (price) => {
  const collect = {
    body: {
      intent: "CAPTURE",
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: price,
          },
        },
      ],
    },
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.ordersCreate(
      collect
    );
    // Get more response info...
    const { statusCode, headers } = httpResponse;
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
      statusCode: statusCode,
      headers: headers
    };
  } catch (error) {
    if (error instanceof ApiError) {
      const { statusCode, headers } = error;
      console.log(error)
      // throw new Error(error.message);
    }
  }
};



// CAPTURAR PEDIDO /**
const captureOrder = async (orderID) => {
  const collect = {
    id: orderID,
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.ordersCapture(
      collect
    );
    // Get more response info...
    // const { statusCode, headers } = httpResponse;
    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      // const { statusCode, headers } = error;
      throw new Error(error.message);
    }
  }
};

async function exchangePrice(cart) {

  
  if (cart.currencyCode === "MZ") {
    let bidUSD = '';
    try {
      const data = await axios.get("https://economia.awesomeapi.com.br/json/last/USD-MZN")
      const bid = data.USDMZN.bid;  // Obtém a cotação 'bid'
      bidUSD = bid;

    } catch (error) {
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
      const exchange = await axios.post("http://127.0.0.1:3013/api/balance", {
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
    const bid_usd = await axios.get("https://economia.awesomeapi.com.br/json/last/USD-MZN")
    const bid = data.USDMZN.bid;  // Obtém a cotação 'bid'
    bid_usd = bid;
  } catch (error) {
    bid_usd = 63.20;
  }
  console.log(bid_usd)
  const exchanged_price = parseFloat((amount * bid_usd).toFixed(2))
  console.log(exchanged_price)
  return Number(exchanged_price)

}


app.post("/api/all-payment", async (req, res) => {
  const { reqType, cart, orderId, transData, productData, buyerData } = req.body;
  // console.log(req.body)


  if (reqType === "save_payment_card") {
    console.log("CAMPOTOS COLETADOS : ", buyerData)
    try {
      
      const netAmount = transData?.seller_receivable_breakdown?.net_amount?.value || 0; // Valor líquido
      console.log(netAmount)
      const grossAmount = transData?.amount?.value; // Valor total pago
      const feeAmount = transData?.seller_receivable_breakdown?.paypal_fee?.value || 0; // Taxa do PayPal
      const paypal_payment_id = transData?.id;
      console.log(netAmount, grossAmount, feeAmount, paypal_payment_id)
      const meticalNetAmount = await exchangePriceToUsd(Number(netAmount));
      const MeticalfeeAmount = await exchangePriceToUsd(Number(feeAmount));
      const MeticalGrossAmount = await exchangePriceToUsd(Number(grossAmount));
      const currency = transData?.amount.currency_code;
      console.log(currency)

      const userId = productData.userId;
      console.log(userId)

      const paymentIdDB = new Date().getTime().toString();

      const paymentData = {
        productId: productData.productId,

        orderId: paypal_payment_id  || "N/A",
        originalAmount: meticalNetAmount,
        feeAmount: MeticalfeeAmount || "N/A",
        paidAmount: MeticalGrossAmount || "N/A",
        paymentName:  buyerData?.Nome || "N/A",
        paymentEmail: buyerData?.Email || "N/A",
        paymentMethod: 'PayPal',
        status: 'approved',
        description: transData?.description || "N/A",
        currency: currency || "N/A",
        nome: productData.name || "N/A",
        timestamp: new Date().toISOString() || "N/A",

      };

      await db.ref(`users/${userId}/payments/${paymentIdDB}`).set(paymentData)
      console.log("Pagamaento criado com sucesso!") 

      return res.status(201).json({ estado: "completado", code: "0", payer_email: buyerData.Email })


    } catch (error) { 
      console.log(error)
      console.log("Ocorreu um erro ao salvar o pagamento!") 
    }
   
  }


  if (reqType === '/api/orders') {
    try {
      // use the cart information passed from the front-end to calculate the order amount detals
      const { cart } = req.body;
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
      const { orderID, data } = req.body;
      console.log(orderID)
      console.log(data)
      const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
      console.log('PEDIDO CAPTURADO COM SUCESSO')
      res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to capture order." });
    }
  }



});







// Endpoint para iniciar pagamento com PayPal
app.post('/api/paypal-back-payment', (req, res) => {
  const { amount, clientId, sucessPage, cancelPage, bidUSD, productId, nameProduct } = req.body;
  console.log(req.body);

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    transactions: [
      {
        amount: {
          currency: 'USD',
          total: amount,
        },
        description: 'payment produto',
      },
    ],
    redirect_urls: {
      return_url: `https://www.dropaymentsmz.online/update/paypal-success?clientId=${encodeURIComponent(clientId)}&sucessPage=${encodeURIComponent(sucessPage)}&bidUSD=${encodeURIComponent(bidUSD)}&emailPayer=${encodeURIComponent(payerEmail)}&productId=${encodeURIComponent(productId)}&nameProduct=${encodeURIComponent(nameProduct)}`,
      cancel_url: `https://www.dropaymentsmz.online/api/paypal-cancel?cancelPage=${encodeURIComponent(cancelPage)}`,
    },
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error('Erro ao criar pagamento:', error);
      res.status(500).json({ error: 'Erro ao processar o pagamento' });
    } else {
      const approvalUrl = payment.links.find((link) => link.rel === 'approval_url').href;
      res.status(200).json({ approvalUrl });
    }
  });
});

// Endpoint para processar sucesso do pagamento
app.get('/api/paypal-success', async (req, res) => {
  const { PayerID, paymentId, clientId, sucessPage, bidUSD, productId, nameProduct } = req.query;

  console.log('Parâmetros recebidos:', req.query);

  if (!PayerID || !paymentId || !clientId) {
    return res.status(400).json({ message: 'Dados insuficientes para processar o pagamento' });
  }

  try {
    const paymentDetails = await new Promise((resolve, reject) => {
      paypal.payment.get(paymentId, (error, payment) => {
        if (error) reject(error);
        else resolve(payment);
      });
    });

    const amount = paymentDetails.transactions[0].amount.total;
    const currency = paymentDetails.transactions[0].amount.currency;
    const payerInfo = paymentDetails.payer.payer_info;
    const namePayer = `${payerInfo.first_name} ${payerInfo.last_name}`;
    const emailPayer = payerInfo.email;
    payerEmail = payerInfo.email;
    payerName = `${payerInfo.first_name} ${payerInfo.last_name}`;

    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: currency,
            total: amount,
          },
        },
      ],
    };

    const executedPayment = await new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
        if (error) reject(error);
        else resolve(payment);
      });
    });

    const transactionDetails = executedPayment.transactions[0].related_resources[0].sale;
    const total = parseFloat(transactionDetails.amount.total);
    const fee = parseFloat(transactionDetails.transaction_fee.value);
    const netAmount = (total - fee).toFixed(2);
    const meticalNetAmount = (netAmount * parseFloat(bidUSD)).toFixed(2);
    const paymentIdDB = new Date().getTime().toString();
    const paymentData = {
      orderId: executedPayment.id,
      originalAmount: meticalNetAmount,
      paidAmount: amount,
      paymentName: namePayer,
      paymentEmail: emailPayer,
      paymentMethod: 'PayPal',
      status: 'approved',
      description: paymentDetails.transactions[0].description,
      currency: currency,
      timestamp: new Date().toISOString(),
    };

    console.log('Dados do pagamento:', paymentData);

    const paymentPromises = [
      admin.database().ref(`users/${clientId}/payments/${paymentIdDB}`).set(paymentData),
      admin.database().ref(`users/${clientId}/paymentsBackup/${paymentIdDB}`).set(paymentData),
      admin.database().ref(`usersPaymentsBackup/${paymentIdDB}`).set(paymentData),
    ];

    await Promise.all(paymentPromises);

    console.log('Pagamento salvo com sucesso!');
    const successPageUrl = `${sucessPage}?id=${encodeURIComponent(productId)}&emailPayer=${encodeURIComponent(payerEmail)}&namePayer=${encodeURIComponent(payerName)}&nameProduct=${encodeURIComponent(nameProduct)}`;
    return res.redirect(successPageUrl);
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return res.status(500).json({ message: 'Erro ao processar ou salvar pagamento.', error });
  }
});

// Endpoint para processar cancelamento do pagamento
app.get('/api/paypal-cancel', (req, res) => {
  const { cancelPage } = req.query;

  if (!cancelPage) {
    return res.status(400).json({ message: 'URL de cancelamento não fornecida.' });
  }

  console.log('Pagamento cancelado. Redirecionando para:', cancelPage);
  res.redirect(cancelPage);
});

// Iniciar o servidor
const port = 3010;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
