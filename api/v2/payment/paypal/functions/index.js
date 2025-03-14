const admin = require('firebase-admin');
const {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController
} = require("@paypal/paypal-server-sdk");






const client_id = process.env.PAY;
const client_secret = process.env.PAYPAL_CLIENT_SECRET_2;

const client_id_live = process.env.PAYPAL_CLIENT_ID_2_LIVE;
const client_secret_live = process.env.PAYPAL_CLIENT_SECRET_2_LIVE;


const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: client_id_live,
    oAuthClientSecret: client_secret_live,
  },
  timeout: 0,
  environment: Environment.Production,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});
const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);




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
      const { statusCode, headers } = error;
      console.log(error)
      throw new Error(error);
    }
  }
};







module.exports = { captureOrder, createOrder };


