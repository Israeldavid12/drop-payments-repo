const axios = require('axios')
const defaultAdmin = require('../config-db/firebase')

const rtdb = defaultAdmin.database();



async function sendNotifications(buyerData, userId, paymentMethod, paymentId, date, product_data) {
  const emailRef = rtdb.ref(`users/${userId}/email`)
  const emailSnapshot = await emailRef.once("value")
  const emailSeller = await emailSnapshot.val()

  console.log(buyerData.email, emailSeller)


  const sellerPayload = { //payload paran o vendedor
    nameProduct: product_data?.name || "N/A",
    originalAmount: product_data?.price,
    namePayer: buyerData?.nome || "N/A",
    emailPayer: buyerData?.email || "N/A",
    emailSeller: emailSeller, // E-mail do vendedor
    timestamp: date,
    templateType: "6-SALES-S", // Tipo de template para o e-mail do vendedor
    paymentId: paymentId,

  }

  const payerPayload = { // payload para o comprador
    paymentMethod: paymentMethod,
    namePayer: buyerData?.name || "N/A",
    emailPayer: buyerData?.email || "N/A",
    nameProduct: product_data?.name || "N/A",
    docUrl: product_data?.docUrl || "N/A",
    templateType: "1-B",
    paymentId: paymentId,
    originalAmount: product_data?.price,
    timestamp: date,
  }

  const [sellerResponse, payerResponse] = await Promise.all([
    axios.post('http://127.0.0.1:3002/api/v2/smtp/send-email', sellerPayload),
    axios.post('http://127.0.0.1:3002/api/v2/smtp/send-email', payerPayload)
  ]);

  if (sellerResponse.status === 200 || payerResponse.status === 200) {
    console.log("E-mail do vendedor ou  do comprador enviados com sucesso!");
    return true
  } else {
    return false
  }





}

module.exports = { sendNotifications }