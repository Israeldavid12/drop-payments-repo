const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();


const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});


// Inicialize o Firebase Admin SDK
const serviceAccount = require("../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json"); // Substitua pelo seu arquivo de credenciais

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app", // Substitua pela URL do seu banco de dados
  storageBucket: "drop-payments-mz.appspot.com", // Adicione esta linha!
});

const db = admin.database();
const fb_firestore = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();


// Middleware para permitir CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

function urlToRelativePath(url) {
  // Regex para remover parâmetros de consulta
  const path = url.split('?')[0]; // Retira a parte depois do "?"

  // Extrai o caminho após "o/" e decodifica caracteres especiais
  const relativePath = path.replace("https://firebasestorage.googleapis.com/v0/b/drop-payments-mz.appspot.com/o/", "");

  return decodeURIComponent(relativePath); // Decodifica espaços e outros caracteres especiais
}

// Rota para calcular e atualizar o saldo
app.post("/api/balance", async (req, res) => {
  console.log("Dados recebidos:", req.body);



  const { userId, reqType, name, email, p_number, p_name, p_metodo, contacto_1, contacto_2, productId } = req.body;

  if (!reqType) {
    return res.status(400).send({ error: "reqType indefinido." });
  }

  if (reqType === 'delete_product') { 
    try {
      console.log(productId);

      const userProductRef = fb_firestore.collection('products').doc(productId);
      const doc = await userProductRef.get(); // Aguarda os dados do produto



      const productData = doc.data();
      console.log("Dados do produto:", productData);

      const product_image = String(productData.imageUrl || '');
      const product_banner = String(productData.bannerUrl);
      const product_doc_url = String(productData.docUrl);

      console.log('1 stage')

      const image_relativePath_for_storage = urlToRelativePath(product_image);
      const banner_relativePath_for_storage = urlToRelativePath(product_banner);
      const doc_relativePath_for_storage = urlToRelativePath(product_doc_url);
      console.log('2 stage')
      const [exists1] = await bucket.file(image_relativePath_for_storage).exists();
      const [exists2] = await bucket.file(banner_relativePath_for_storage).exists();
      const [exists3] = await bucket.file(doc_relativePath_for_storage || "N/A").exists();
      console.log('3 stage')


      // EXCLUSAO DO BANNER
      if (exists2) {
        if (product_banner.includes('firebasestorage')) {
          const banner_relativePath = urlToRelativePath(product_banner);
          await bucket.file(banner_relativePath).delete()
          console.log(`Banner excluído com sucesso.`);
        }

      } else {
        console.log('O banner NÃO existe no Storage.');
      }

      if (product_banner.includes('megaofertasco.store')) {
        const fileKey = product_banner.replace(/^https?:\/\/[^\/]+\//, "");
        console.log(fileKey);

        const command = new DeleteObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET,
          Key: fileKey,
        });

        await s3.send(command);
        console.log('Banner excluido com sucesso')

      }
      console.log('4 stage')
      //EXLUSAO DA IMAGEM
      if (exists1) {
        if (product_image.includes('firebasestorage') && product_banner.includes('')) {
          const image_relativePath = urlToRelativePath(product_image);
          await bucket.file(image_relativePath).delete()
          console.log(`Imagem excluída com sucesso.`);
        }
      } else {
        console.log('A imagem NÃO existe no Storage.');
      }

      if (product_image.includes('megaofertasco.store')) {
        const fileKey = product_image.replace(/^https?:\/\/[^\/]+\//, "");
        console.log(fileKey);

        const command = new DeleteObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET,
          Key: fileKey,
        });

        await s3.send(command);
        console.log('Imagem excluida com sucesso')

      }



      // EXCLUSAO DO DOCUMENTO
      if (exists3) {
        if (product_doc_url.includes('firebasestorage')) {
          const doc_relativePath = urlToRelativePath(product_doc_url);
          await bucket.file(doc_relativePath).delete()
          console.log('Documento exluido com sucesso')
        }
      } else {
        console.log('O documento NÃO existe')
      }

      if (product_doc_url.includes('megaofertasco.store')) {
        const fileKey = product_doc_url.replace(/^https?:\/\/[^\/]+\//, "");
        console.log(fileKey);

        const command = new DeleteObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET,
          Key: fileKey,
        });

        const data = await s3.send(command);
        console.log('Documento excluido com sucesso', data)
      } else {
        console.log('Documento nao excluido')
      }



      await userProductRef.delete(); // Exclui o documento

      // Deduz a quantidade de produtos no Firebase
      const quantityRef = db.ref(`users/${userId}/quantity`);
      const q_snapshot = await quantityRef.once("value");
      const quantity = Number(q_snapshot.val());
      await quantityRef.set(quantity - 1);

      return res.status(200).json({ message: 'Produto excluído com sucesso.' });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Erro interno do servidor.', err: error });
    }
  }




  if (reqType === 'user_checkout_config') {

    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });
    }

    try {

      const checkoutconfigRef = db.ref(`users/${userId}/checkoutUserConfig`);

      const checkSnapShot = await checkoutconfigRef.once('value');
      const checkout = checkSnapShot.val();

      return res.status(200).json({ checkout: checkout });

    } catch (error) {
      return res.status(500).json({ status: 'Erro interno do servidor!', error: error });
    }


  }



  if (reqType === 'product_data') {
    try {

      const productRef = fb_firestore.collection("products").doc(productId);
      const snapDoc = await productRef.get();

      if (snapDoc.exists) {
        const product = snapDoc.data();
        console.log(product)

        return res.status(200).json({ status: 'succcess', product: product });
      } else {
        console.log("Produto não encontrado!");
        return res.status(200).send({ status: 'Produto nao encontrado!', code: 'E-0' });
      }




    } catch (error) {
      console.error("Erro ao buscar produto:", error); // Adicionado para debug
      return res.status(500).json({ status: 'Erro interno do servidor!', error: error });
    }

  }



  if (reqType === 'fech_user_products') {

    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });
    }

    try {
      const userProductRef = fb_firestore.collection("products");
      const querySnapshot = await userProductRef.where("userId", "==", userId).get();


      if (querySnapshot.empty) {
        console.log("Nenhum produto encontrado para este usuário.");
        return res.status(200).json({ error: 'Nenhum produto encontrado para este usuário.', code: '404' });
      }

      // Converter os documentos para um array
      const products = querySnapshot.docs.map((doc) => ({
        productId: doc.id,
        ...doc.data(),
      }));



      return res.status(200).json({ produtos: products });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: '{status : 500} : erro interno do servidor' });
    }


  }



  if (reqType === 'save_user_data') {

    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });
    }
    try {

      const userRef = db.ref(`users/${userId}/`);
      const contactRef = db.ref(`users/${userId}/contact`);
      const paymentRef = db.ref(`users/${userId}/userpaymentMethods`);
      const data = {
        'name': name,
        'email': email
      }
      const paymentData = {
        'numero': p_number,
        'titular': p_name,
        'metodo': p_metodo
      }
      const contactData = {
        'contacto_1': contacto_1,
        'contacto_2': contacto_2
      }

      contactRef.set(contactData)
        .then(() => {
          console.log("Dados criados com sucesso!");
          //return res.status(200).json({ status: 'success' });
        })
        .catch((erro) => {
          console.error("Erro ao criar dados:", erro);
          return res.status(400).json({ erro: erro.message });
        });



      await paymentRef.update(paymentData, (erro) => {
        if (erro) {
          console.error("Erro ao atualizar numero:", erro);
          return res.status(400).json({ erro: erro.message });
        } else {
          console.log("Numero atualizado com sucesso!");

        }
      });



      userRef.update(data, (erro) => {
        if (erro) {
          console.error("Erro ao atualizar nome:", erro);
          return res.status(400).json({ erro: erro });
        } else {
          console.log("Nome atualizado com sucesso!");
          return res.status(200).json({ status: 'Informacoes salvas com sucesso!' });
        }
      });


    } catch (error) {
      console.log(error);
      return res.status(500).json({ erro: '{status : 500} : erro interno do servidor' });
    }
  }


  if (reqType === 'user_payment_data') {

    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });
    }
    try {
      const user_payment_methodRef = db.ref(`users/${userId}/userpaymentMethods`);

      // Obter o snapshot do nó
      const snapshot = await user_payment_methodRef.once('value');

      // Verificar se o nó existe
      if (snapshot.exists()) {
        const keys = snapshot.val();
        console.log('Chaves:', keys);
        return res.status(200).json({ data: keys }); // Retorna as chaves encontradas
      } else {
        console.log('O nó não existe ou está vazio.');
        return res.status(404).json({ error: '{status : 404} : dados nao encontrados' });
      }
    } catch (error) {
      console.error('Erro:', error);
      return res.status(500).json({ error: '{status : 500} : erro interno do servidor' });
    }

  }



  if (reqType === 'user_data') {

    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });
    }
    try {
      const paymentsRef = db.ref(`users/${userId}/payments`);
      const balanceRef = db.ref(`users/${userId}/balance`);
      const emailRef = db.ref(`users/${userId}/email`);
      const nameRef = db.ref(`users/${userId}/name`);
      const contactRef = db.ref(`users/${userId}/contact`);

      const paypalBalanceRef = db.ref(`users/${userId}/paypalBalance`);
      let total = 0;
      let vendasHoje = 0;
      let paypalBalance = 0;

      // Obter a data de hoje
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      // Recuperar todas as transações
      const snapshot = await paymentsRef.once("value");

      const updates = {}; // Objeto para batch updates
      let foundNewTransactions = false;
      let foundNewPayPalTransactions = false;

      snapshot.forEach((childSnapshot) => {
        const payment = childSnapshot.val();
        const paymentKey = childSnapshot.key;

        // Verifique o estado da transação para saldo geral
        if (payment.estado !== "computado" &&
          payment.originalAmount &&
          (payment.paymentMethod === "E-Mola" || payment.paymentMethod === "M-pesa" || payment.paymentMethod === "dp-wallet")) {
          total += parseFloat(payment.originalAmount);
          foundNewTransactions = true;

          // Marcar transação como computada
          updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
        }

        // Calcular vendas realizadas hoje
        if (payment.timestamp && payment.originalAmount) {
          const paymentDate = new Date(payment.timestamp).toISOString();
          if (paymentDate >= startOfDay && paymentDate <= endOfDay) {
            vendasHoje += parseFloat(payment.originalAmount);
          }
        }

        // Verifique se a transação é do PayPal
        if (payment.paymentMethod === "PayPal" && payment.estado !== "computado" && payment.originalAmount) {
          paypalBalance += parseFloat(payment.originalAmount);
          foundNewPayPalTransactions = true;

          // Marcar transação como computada
          updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
        }
      });

      // Arredondar valores para 2 casas decimais
      total = parseFloat(total.toFixed(2));
      vendasHoje = parseFloat(vendasHoje.toFixed(2));
      paypalBalance = parseFloat(paypalBalance.toFixed(2));

      //Pegar informacoes do usuario
      const emailSnapshot = await emailRef.once("value");
      const user_email = emailSnapshot.val() || 'N/A';
      const namelSnapshot = await nameRef.once("value");
      const user_name = namelSnapshot.val() || 'N/A';
      const contactSnapshot = await contactRef.once('value');
      let contact_data = '';

      if (contactSnapshot.exists()) {
        contact_data = contactSnapshot.val();
        console.log('Dados:', contact_data.contacto_1); // Exibe os dados no console
      } else {
        console.log('O nó não existe.');
      }

      // Recuperar o saldo atual
      const balanceSnapshot = await balanceRef.once("value");
      const currentBalance = balanceSnapshot.val() || 0;

      const paypalBalanceSnapshot = await paypalBalanceRef.once("value");
      const currentPayPalBalance = paypalBalanceSnapshot.val() || 0;

      // Somar os saldos atuais com os novos valores (se houver)
      const newBalance = foundNewTransactions ? currentBalance + total : currentBalance;
      const newPayPalBalance = foundNewPayPalTransactions ? currentPayPalBalance + paypalBalance : currentPayPalBalance;

      // Atualizar os saldos no diretório do usuário
      updates[`users/${userId}/balance`] = newBalance;
      updates[`users/${userId}/paypalBalance`] = newPayPalBalance;

      // Salvar todas as atualizações no banco de dados
      await db.ref().update(updates);

      // Retornar o valor do saldo atualizado, PayPal e vendas do dia
      res.status(200).send({ balance: newBalance, vendasHoje, paypalBalance: newPayPalBalance, user_name: user_name, user_email: user_email, contacto_1: contact_data.contacto_1, contacto_2: contact_data.contacto_2 });
    } catch (error) {
      console.error("Erro ao processar o saldo:", error);
      res.status(500).send({ error: "Erro ao processar o saldo." });
    }
  }

});






// Endpoint para obter o nome do usuário pelo email
app.post('/api/get-user-info', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'O email é obrigatório.' });
    }

    // Obter o ID do usuário pelo email
    const userRecord = await admin.auth().getUserByEmail(email);
    const userId = userRecord.uid;

    // Acessar o diretório do Realtime Database
    const db = admin.database();
    const userRef = db.ref(`users/${userId}/name`);
    const userNameSnapshot = await userRef.once('value');
    const userName = userNameSnapshot.val();

    if (!userName) {
      return res.status(404).json({ error: 'Nome do usuário não encontrado.' });
    }

    // Retornar o nome e email do usuário
    res.json({
      email: email,
      name: userName,
      userId: userId,
      estado: "success"
    });
  } catch (error) {
    console.error('Erro ao obter informações do usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.', details: error.message });
  }
});

// Endpoint de pagamento
app.post('/api/send-amount', async (req, res) => {
  const { userId, email, sender_id, balance_wallet, wallet_destin, amount, sender_email } = req.body;

  if (!userId || !email || !sender_id || !balance_wallet || !wallet_destin || !amount) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Recuperar o saldo atual do remetente
    const senderBalanceRef = db.ref(`users/${sender_id}/balance`);
    const senderBalanceSnapshot = await senderBalanceRef.once('value');

    const senderBalance = senderBalanceSnapshot.val();
    if (senderBalance < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente.' });
    }

    // Deduzir o valor do saldo do remetente
    const newSenderBalance = senderBalance - amount;
    await senderBalanceRef.set(newSenderBalance);

    // Subtrair a taxa de 8
    const fee = 8;
    const amountAfterFee = amount - fee;

    // Gerar ID único para o pagamento
    const paymentId = uuidv4();
    const timestamp = Date.now();

    // Salvar a taxa de 8 no diretório especificado
    await db.ref(`users/iIpkewISsJTlu0Lh7d1YxJ3ZTK12/payments/${paymentId}`).set({
      originalAmount: fee,
      paymentMethod: 'dp-wallet',
      timestamp: timestamp
    });

    // Salvar o valor restante no diretório do destinatário
    await db.ref(`users/${userId}/payments/${paymentId}`).set({
      originalAmount: amount - 8,
      timestamp: timestamp,
      paymentMethod: wallet_destin
    });

    // Enviar a requisição para o endpoint de email
    const emailPayload = {
      emailSeller: email,
      originalAmount: amount,
      amountPaid: amountAfterFee,
      fee: fee,
      paymentId: paymentId,
      timestamp: new Date().toISOString(),
      templateType: '8-P-R'
    };

    await axios.post('http://127.0.0.1:3001/api/send-email', emailPayload);

    // Responder com sucesso
    res.status(200).json({
      message: 'sent',
      paymentId: paymentId
    });
  } catch (error) {
    console.error('Erro ao processar o pagamento:', error);
    res.status(500).json({ error: 'Erro ao processar o pagamento.' });
  }
});

// Iniciar o servidor
const PORT = 3013;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
