const express = require("express");
const admin = require("firebase-admin");
const axios = require("axios")
const bodyParser = require("body-parser");
const { Utils } = require("../../../backend/functions/index.js")
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const serviceAccount = require("../../../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json");
require("dotenv").config();
const { DatabaseUtils, DbCreateUtils, DbGetDataUtils } = require("../../../backend/config-db/supabase-postgres.js")



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






app.post("/api/v2/live/server", async (req, res) => {
  console.log("Dados recebidos:", req.body);
  const { userId, reqType, productId, price, exchange_type } = req.body;

  if (!reqType) {
    return res.status(400).send({ error: "reqType indefinido." });
  }

   if (reqType === 'verifyEmail') {
    
   }

  if (reqType === 'get/user-products') {
    await DbGetDataUtils.getProducts(req, res)
   
  }

  if (reqType === 'create/product') {
    const { productData } = req.body;
    console.log(productData)
    if (!productData) {
      return res.status(400).send({ error: "productData é obrigatório." });
    }
    try {
      const response = await DbCreateUtils.createProduct(productData);
      if (response) {
        return res.status(200).json({ message: "Produto criado com sucesso", code: "200" })
      } else {
        return res.status(400).json({ message: "Erro ao criar produto", code: "400" })
      }

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Erro interno do servidor", code: "1" })

    }

  }

  if (reqType === 'save/user-data') {
    const { data } = req.body;
    console.log(data)
    if (!data) {
      return res.status(400).send({ error: "data é obrigatório." });
    }
    try {
      const response = await DataUpdateUtils.saveUserData(data);
      if (response) {
        return res.status(200).json({ message: "Dados salvos com sucesso", code: "0" })
      } else {
        return res.status(400).json({ message: "Erro ao salvar dados", code: "1" })
      }

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Erro interno do servidor", code: "1" })

    }

  }


  if (reqType === 'set/payout-method') {
    const { account_holder, account_id, method_type, id, user_id } = req.body;

    console.log(req.body)
    if (!account_holder || !account_id || !method_type) {
      return res.status(400).send({ error: "Todos os campos são obrigatórios." });
    }
    try {
      const payoutMethod = await DatabaseUtils.setPayoutMethod(user_id, id, account_holder, account_id, method_type);

      if (payoutMethod) {
        return res.status(200).json({ message: "Método de pagamento salvo com sucesso", code: "0" })
      } else {
        return res.status(400).json({ message: "Erro ao salvar método de pagamento", code: "1" })
      }

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Erro interno do servidor", code: "1" })
    }
  }

  if (reqType === 'get/payout-method') {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({ error: "id é obrigatório." });
    }
    try {
      const payoutMethod = await DatabaseUtils.getPayoutMethod(id);
      return res.status(200).json({ payoutMethod: payoutMethod });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Erro interno do servidor", code: "1" })
    }
  }

  if (reqType === 'delete/user-data') {
    const { id, table } = req.body;
    console.log(id, table)
    if (!id) {
      return res.status(400).send({ error: "id é obrigatório." });
    }

    try {
      const delete_response = await DatabaseUtils.deleteUserData(id, table);
      if (delete_response === true) {
        return res.status(200).json({ message: "Dados excluidos com sucesso", code: "0" })
      } else {
        return res.status(400).json({ message: "Erro ao excluir dados", code: "1" })
      }

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Erro interno do servidor", code: "1" })

    }
  }

  if (reqType === 'get/payout_methods') {
    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });
    }

    try {
      const payoutMethods = await DatabaseUtils.getUserPayoutMethos(userId);
      return res.status(200).json({ payoutMethods: payoutMethods });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "Erro interno do servidor", code: "1" })
    }
  }

  if (reqType === "get/user-data") {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).send({ error: "userId é obrigatório." });

    } else {
      try {
        const userData = await DatabaseUtils.getUserBasicData(userId);
        if (userData) {
          return res.status(200).json({ userData: userData });
        } else {
          return res.status(400).json({ message: "Erro ao buscar dados do usuario", code: "1" })
        }


      } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Erro interno do servidor", code: "1" })

      }

    }

  }


  if (reqType === "update/last-login") {
    const { userId } = req.body;
    console.log(userId)
    if (!userId) {
      return res.status(400).json({ message: "userId invalido!", code: "3" })
    } else {
      try {
        const update_response = await DatabaseUtils.updateLastLogin(userId);
        if (update_response === true) {
          return res.status(200).json({ message: "Ultimo login atualizado com sucesso", code: "0" })
        } else {
          return res.status(400).json({ message: "Erro ao atualizar ultimo login", code: "1" })
        }

      } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Erro interno do servidor", code: "1" })

      }
    }

  }

  if (reqType === "save/user") {

    // await saveUser(req, res);
    const { userId, email, name } = req.body;
    console.log(userId)

    if (!userId) {
      return res.status(400).json({ message: "userId invalido!", code: "3" })
    } else {

      try {
        const save_response = await DatabaseUtils.saveUserOnSupabase(userId, name, email);

        if (save_response === true) {
          return res.status(200).json({ message: "Usuario criado com successo", code: "0" })
        } else {
          return res.status(400).json({ message: "Erro ao criar usuario", code: "1" })
        }

      } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Erro interno do servidor", code: "1", error: error })

      }
    }

  }

  if (reqType === "verifyOtp") {
    verifyOTP(req, res)
  }

  if (reqType === "otp/code") {
    const { email } = req.body;
    console.log(req.body)

    try {
      const emailExists = await DatabaseUtils.verificarEmail(email);

      if (emailExists === true) {
        return res.status(400).json({ message: "email already exists" });

      } else {

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

        const request = await axios.post('https://www.dropaymentsmz.online/api/v2/smtp/send-email', otpEmailPayload);
        console.log(request.data)


        return res.status(200).json({ message: 'OTP enviado!', code: '0' });
      }

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
    const { fileName, contentType, dir_file } = req.body;

    if (!fileName || !contentType, !dir_file) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    try {
      const data = await Utils.generatePresignedUrl(fileName, contentType, dir_file);
      console.log(data)
      const url = data.signedUrl;
      const filePathUrl = data.filePath;
      return res.status(200).json({ presignedUrl: url, filePath: filePathUrl });
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: "Erro ao gerar Presigned URL", deatils: error });
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








});


app.get("/api/v2/live/server", (req, res) => {
  res.send("run");
});






// Iniciar o servidor
const PORT = 3013;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
