const express = require("express");
const admin = require("firebase-admin");
const axios = require("axios")
const bodyParser = require("body-parser");
const { urlToRelativePath, convertCurrency, generatePresignedUrl } = require("../../../backend/functions/index.js")
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const serviceAccount = require("../../../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json"); //
require("dotenv").config();






const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

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

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    // Buscar OTP no banco de dados
    const snapshot = await db.ref(`otp_codes/${email.replace('.', '_')}`).get();

    if (!snapshot.exists()) {
      return res.status(400).json({ error: "OTP inválido ou expirado!" });
    }

    const storedOTP = snapshot.val();

    // Verificar se o OTP expirou
    if (Date.now() > storedOTP.expiresAt) {
      await db.ref(`otp_codes/${email.replace('.', '_')}`).remove();
      return res.status(400).json({ message: "OTP expirado!" });
    }

    // Verificar se o OTP é válido
    if (otp != storedOTP.otp) {
      return res.status(400).json({ message: "OTP incorreto!" });
    }

    // Remover OTP do banco após o uso
    await db.ref(`otp_codes/${email.replace('.', '_')}`).remove();

    return res.status(200).json({ message: "OTP verificado com sucesso!", code: "0" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno do servidor!" });
  }
}


async function saveUser(req, res) {
  console.log(req.body)
  const { userId, email, name } = req.body;
  console.log(userId)
  if (!userId) {
    return res.status(400).json({ message: "userId invalido!", code: "3" })
  }

  try {

    const userRef = db.ref(`users/${userId}`);
    await userRef.set({
      email: email || "N/A",
      name: name || "N/A",
    });

    return res.status(200).json({ message: "Usuario criado com successo", code: "0" })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Erro interno do servidor", code: "1" })

  }

}








// Rota para calcular e atualizar o saldo
app.post("/api/v2/live/server", async (req, res) => {
  console.log("Dados recebidos:", req.body);
  const { userId, reqType, name, email, nationalId, p_number, p_name, p_metodo, contacto_1, contacto_2, productId, currency, price, exchange_type } = req.body;



  if (!reqType) {
    return res.status(400).send({ error: "reqType indefinido." });
  }

  if (reqType === "save/user") {
    await saveUser(req, res);

  }

  if (reqType === "verifyOtp") {
    verifyOTP(req, res)
  }

  if (reqType === "otp/code") {
    const { email } = req.body;
    console.log(req.body)
    try {

      // Gerar um número de 6 dígitos aleatórios
      const randomSixDigitNumber = () => {
        return Math.floor(100000 + Math.random() * 900000);
      };

      const otp = randomSixDigitNumber();
      console.log("OTP gerado:", otp);

      const expiresAt = Date.now() + 5 * 60 * 1000;

      // Salvar no Firebase Realtime Database
      await db.ref(`otp_codes/${email.replace('.', '_')}`).set({
        otp,
        expiresAt
      });

      const otpEmailPayload = {
        otp_code: otp,
        emailSeller: email,
        templateType: '7-OTP-CODE'
      }

      const request = await axios.post('http://127.0.0.1:3002/api/v2/smtp/send-email', otpEmailPayload);


      return res.status(200).json({ message: 'OTP enviado!', code: '0' });

    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Error interno do servidor!' });
    }
  }

  if (reqType === "create") {

    try {

      // Verifica a quantidade de produtos no Firebase
      const quantityRef = db.ref(`users/${userId}/quantity`);
      const q_snapshot = await quantityRef.once("value");
      const quantity = Number(q_snapshot.val());

      if (quantity >= 15) {
        return res.status(400).json({ message: "Você atingiu o número máximo de produtos!" });
      }



      const productId = Date.now().toString(); // ID do produto

      const docRef = fb_firestore.doc(`products/${productId}`);
      let newDocUrl = '';

      if (docUrl === 'PAYMENT-ONLY') {
        newDocUrl = 'PAYMENT-ONLY';
      } else {
        newDocUrl = docUrl;
      }

      const productData = {
        productId: productId,
        userId: userId,
        name: product_name,
        price: product_price,
        description: product_description,
        imageUrl: image_url,
        bannerUrl: banner_url,
        docUrl: newDocUrl,
        createdAt: new Date().toISOString()

      }
      console.log(productData)

      await docRef.set(productData);
      console.log(docRef.id)

      // Atualiza a quantidade no Firebase
      await quantityRef.set(quantity + 1);

      return res.json({ message: "Produto criado com sucesso!", docUrl: newDocUrl });

    } catch (error) {
      console.error("Erro no upload:", error);
      return res.status(500).json({ error: "Erro interno do servidor.", details_error: error });
    }

  }

  if (reqType === 'presigned_url') {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    try {
      const data = await generatePresignedUrl(fileName, contentType, dir_file);
      console.log(data)
      const url = data.signedUrl;
      const filePathUrl = data.filePath;
      return res.status(200).json({ presignedUrl: url, filePath: filePathUrl });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao gerar Presigned URL" });
    }

  }

  if (reqType === "/api/edit-product") {

    try {
      const { product_name, product_price, old_image_url, new_image_url, product_id } = req.body;

      console.log(req.body)

      const image = String(old_image_url);

      if (image.includes('firebasestorage')) {

        const relativePath = urlToRelativePath(image);

        await bucket.file(relativePath).delete();
        console.log(`Arquivo "${relativePath}" excluído com sucesso.`);

        console.log('imagem salva no R2')


        const productRef = fb_firestore.doc(`products/${product_id}`);

        await productRef.update({
          imageUrl: new_image_url || '',
          name: product_name || '',
          price: product_price !== undefined ? product_price : 10,
        });
        console.log("imageUrl atualizado com sucesso!");




        console.log('contem firebasestorage ')
        console.log(old_image_url)
      } else {

        console.log(old_image_url)
        // Extrai o caminho do arquivo removendo o domínio
        const fileKey = old_image_url.replace(/^https?:\/\/[^\/]+\//, "");

        // Agora fileKey será "uploads/images/1738658325326-netflix-baner (2).png"
        console.log(fileKey);

        const command = new DeleteObjectCommand({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET,
          Key: fileKey,
        });

        await s3.send(command);
        console.log(`Arquivo '${fileKey}' excluído com sucesso.`);

        console.log('imagem salva no R2')


        const productRef = fb_firestore.doc(`products/${product_id}`);

        await productRef.update({
          imageUrl: new_image_url || '',
          name: product_name || '',
          price: product_price !== undefined ? product_price : 10,
        });
        console.log("imageUrl atualizado com sucesso!");



        console.log('nao contem firebasestorage ')
      }


      return res.json({ message: "Produto atualizado com sucesso!" });
    } catch (error) {
      console.error("Erro no upload:", error);
      return res.status(500).json({ error: "Erro ao enviar arquivos." });
    }
  }

  if (reqType === "exchange") {
    try {

      exchange_price = Number(price)

      if (exchange_type) {

        switch (exchange_type) {
          case "MZN-BRL":
            const brl = await convertCurrency(Number(price), "MZN-BRL")
            return res.status(200).json({ result: brl.result, cot: brl.c_rate })
            break;
          case "MZN-USD":
            const usd = await convertCurrency(Number(price), "MZN-USD")
            return res.status(200).json({ result: usd.result, cot: usd.c_rate })
            break;
          case "MZN-ZAR":
            const zar = await convertCurrency(Number(price), "MZN-ZAR")
            return res.status(200).json({ result: zar.result, cot: zar.c_rate })
            break;
          default:
            break;
        }

      } else {
        return res.status(500).json({ mesage: "Tipo de conersao indefinido" })
      }


    } catch (error) {
      console.log(error)
      return res.status(500).json({ mesage: "Erro interno do servidor." })

    }

  }

  if (reqType === "user_sales") {
    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });
    }

    try {
      const salesUserRef = db.ref(`users/${userId}/payments`);
      const salesSnapshot = await salesUserRef.once("value");

      if (salesSnapshot.exists()) {
        const sales = salesSnapshot.val();
        let sales_array = [];
        sales_array = sales;
        sales_array = Object.entries(sales_array).map(([id, objeto]) => ({ id, ...objeto }));
        return res.status(200).json({ sales: sales_array })
      } else {
        console.log("Nenhum produto encotrado.")
        return res.status(200).json({ mesage: "Nenhum produto encotrado." })
      }


    } catch (error) {
      console.log(error)
      return res.status(500).json({ mesage: "Erro interno do servidor." })

    }

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

  if (reqType === 'save_user_checkout_config') {

    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });
    }

    try {
      const { checkout, userId } = req.body;
      console.log(req.body);
      const checkoutconfigRef = db.ref(`users/${userId}/checkoutUserConfig`);

      checkoutconfigRef.set(checkout)
        .then(() => {
          console.log('Informacoes salvas com sucesso')
          return res.status(200).json({ message: 'Informacoes salvas com sucesso', status: '201' });
        })
        .catch((error) => {
          console.log('Erro ao salvar informacoes')
          return res.status(400).json({ error: error });
        });

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Erro interno do servidor!', error: error });

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
        'email': email,
        'nationalId': nationalId
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
      const nationalIdRef = db.ref(`users/${userId}/nationalId`);
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
      // const snapshot = await paymentsRef.once("value");

      const updates = {}; // Objeto para batch updates
      let foundNewTransactions = false;
      let foundNewPayPalTransactions = false;

      // snapshot.forEach((childSnapshot) => {
      //   const payment = childSnapshot.val();
      //   const paymentKey = childSnapshot.key;




      //   // // Verifique o estado da transação para saldo geral
      //   // if (payment.estado !== "computado" &&
      //   //   payment.originalAmount &&
      //   //   (payment.paymentMethod === "E-Mola" || payment.paymentMethod === "M-pesa" || payment.paymentMethod === "dp-wallet")) {
      //   //   total += parseFloat(payment.originalAmount);
      //   //   foundNewTransactions = true;

      //   //   // Marcar transação como computada
      //   //   updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
      //   // }

      //   // Calcular vendas realizadas hoje
      //   if (payment.timestamp && payment.originalAmount) {
      //     const paymentDate = new Date(payment.timestamp).toISOString();
      //     if (paymentDate >= startOfDay && paymentDate <= endOfDay) {
      //       vendasHoje += parseFloat(payment.originalAmount);
      //     }
      //   }

      //   // Verifique se a transação é do PayPal
      //   if (payment.paymentMethod === "PayPal" && payment.estado !== "computado" && payment.originalAmount) {
      //     paypalBalance += parseFloat(payment.originalAmount);
      //     foundNewPayPalTransactions = true;

      //     // Marcar transação como computada
      //     updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
      //   }
      // });

      // // Arredondar valores para 2 casas decimais
      // total = parseFloat(total.toFixed(2));
      // vendasHoje = parseFloat(vendasHoje.toFixed(2));
      // paypalBalance = parseFloat(paypalBalance.toFixed(2));

      //Pegar informacoes do usuario
      const emailSnapshot = await emailRef.once("value");
      const user_email = emailSnapshot.val() || 'N/A';
      const namelSnapshot = await nameRef.once("value");
      const user_name = namelSnapshot.val() || 'N/A';
      const nationalIdSnapshot = await nationalIdRef.once("value");
      const nationalId = nationalIdSnapshot.val() || 'N/A';
      const contactSnapshot = await contactRef.once('value');
      let contact_data = '';

      if (contactSnapshot.exists()) {
        contact_data = contactSnapshot.val() || 'N/A';
        console.log('Dados:', contact_data); // Exibe os dados no console
      } else {
        console.log('O nó não existe.');
      }

      // Recuperar o saldo atual
      const balanceSnapshot = await balanceRef.once("value");
      const currentBalance = balanceSnapshot.val() || 0;

      const paypalBalanceSnapshot = await paypalBalanceRef.once("value");
      const currentPayPalBalance = paypalBalanceSnapshot.val() || 0;

      // Somar os saldos atuais com os novos valores (se houver)
      // const newBalance = foundNewTransactions ? currentBalance + total : currentBalance;
      const newPayPalBalance = foundNewPayPalTransactions ? currentPayPalBalance + paypalBalance : currentPayPalBalance;

      // Atualizar os saldos no diretório do usuário
      // updates[`users/${userId}/balance`] = newBalance;
      updates[`users/${userId}/paypalBalance`] = newPayPalBalance;

      // Salvar todas as atualizações no banco de dados
      // await db.ref().update(updates);

      console.log(nationalId);

      // Retornar o valor do saldo atualizado, PayPal e vendas do dia
      res.status(200).send({ balance: currentBalance, vendasHoje, paypalBalance: newPayPalBalance, user_name: user_name, user_email: user_email, nationalId: nationalId, contacto_1: contact_data.contacto_1, contacto_2: contact_data.contacto_2 });
    } catch (error) {
      console.error("Erro ao processar o saldo:", error);
      res.status(500).send({ error: "Erro ao processar o saldo." });
    }
  }


});


app.get("/api/v2/live/server", (req, res) => {
  res.send("run");
});






// Iniciar o servidor
const PORT = 3013;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
