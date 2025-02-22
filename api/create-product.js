const express = require("express");
const admin = require("firebase-admin");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config();

// Configuração do Cloudflare R2
const s3 = new S3Client({ 
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// 🔹 Inicializa o Firebase Admin SDK
const serviceAccount = require("../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.database();
const fb_firestore = admin.firestore();
const storage = admin.storage();
const app = express();


app.use(express.json());


// // 🔹 Aumentando o limite de requisições para 50MB
// app.use(express.json({ limit: '60mb' }));
// app.use(express.urlencoded({ limit: '60mb', extended: true }));

// // 🔹 Configuração do Multer (Memória, sem salvar localmente)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 60 * 1024 * 1024 },  // Limita o upload a 50MB
// });

// 🔹 Middleware para permitir CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// // **Rota de Upload**
// app.post("/api/upload",
//   upload.fields([
//     { name: "product_image", maxCount: 1 },
//     { name: "product_banner", maxCount: 1 },
//     { name: "docUrl", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const { userId, product_name, product_price, product_description, docUrl } = req.body;

//       console.log(docUrl)



//       if (!userId) {
//         return res.status(400).send({ error: "userId é obrigatório." });
//       }

//       // 🔹 Verifica a quantidade de produtos no Firebase
//       const quantityRef = db.ref(`users/${userId}/quantity`);
//       const q_snapshot = await quantityRef.once("value");
//       const quantity = Number(q_snapshot.val());

//       if (quantity >= 15) {
//         return res.status(400).json({ message: "Você atingiu o número máximo de produtos!" });
//       }

//       // 🔹 Lista de arquivos para upload
//       const uploadedFiles = [];

//       // Faz o upload dos arquivos enviados
//       for (const fieldName of ["product_image", "product_banner", "docUrl"]) {
//         if (req.files[fieldName]) {
//           const file = req.files[fieldName][0]; // Pega o primeiro arquivo do campo

//           // Define o caminho do arquivo com base no fieldName
//           let fileName;
//           if (fieldName === "docUrl") {
//             fileName = `uploads/docs/${Date.now()}-${file.originalname}`;  // Salva docUrl em uploads/docs
//           } else if (fieldName === "product_banner") {
//             fileName = `uploads/banners/${Date.now()}-${file.originalname}`;  // Salva product_banner em uploads/banners
//           } else {
//             fileName = `uploads/images/${Date.now()}-${file.originalname}`;  // Salva product_image em uploads/images
//           }

//           // 🔹 Parâmetros para envio ao Cloudflare R2
//           const uploadParams = {
//             Bucket: process.env.CLOUDFLARE_R2_BUCKET,
//             Key: fileName,
//             Body: file.buffer, // Arquivo em memória
//             ContentType: file.mimetype,
//           };

//           // Envia o arquivo para o Cloudflare R2
//           await s3.send(new PutObjectCommand(uploadParams));

//           // URL do arquivo no R2
//           const fileUrl = `https://megaofertasco.store/${fileName}`;
//           uploadedFiles.push({ fieldName, url: fileUrl });
//         }
//         console.log('criando produtos...')
//       }


//       const productId = Date.now().toString(); // ID do produto

//       const docRef = fb_firestore.doc(`products/${productId}`);
//       let newDocUrl = '';

//       if (uploadedFiles[2] && uploadedFiles[2].url) {
//         newDocUrl = uploadedFiles[2].url;
//       } else if (docUrl === 'PAYMENT-ONLY') {
//         newDocUrl = 'PAYMENT-ONLY';
//       } else {
//         newDocUrl = docUrl;
//       }



//       const productData = {
//         productId: productId,
//         userId: userId,
//         name: product_name,
//         price: product_price,
//         description: product_description,
//         imageUrl: uploadedFiles[0].url,
//         bannerUrl: uploadedFiles[1].url,
//         docUrl: newDocUrl,
//         createdAt: new Date().toISOString()

//       }
//       console.log(productData)

//       await docRef.set(productData);
//       console.log(docRef.id)

//       // Atualiza a quantidade no Firebase
//       await quantityRef.set(quantity + 1);

//       return res.json({ message: "Produto criado com sucesso!", files: uploadedFiles });
//     } catch (error) {
//       console.error("Erro no upload:", error);
//       return res.status(500).json({ error: "Erro ao enviar arquivos." });
//     }
//   }
// );








async function generatePresignedUrl(fileName, contentType, dir_file) {
  const filePath = `uploads/${dir_file}/${Date.now()}-${fileName}`
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET,
    Key: filePath,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // Expira em 1 hora
  return {
    signedUrl: signedUrl,
    filePath: filePath
  };
}




app.post("/api/create-product", async (req, res) => {
  console.log("Dados recebidos:", req.body);

  const { userId, product_name, product_price, product_description, docUrl, image_url, banner_url, reqType, fileName, contentType, dir_file } = req.body;

  if (!userId) {
    return res.status(400).send({ error: "userId é obrigatório." });
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

  if (!fileName || !contentType) {
    return res.status(400).json({ error: "Parâmetros inválidos" });
  }

  try {
    const data = await generatePresignedUrl(fileName, contentType, dir_file);
    console.log(data)
    const url = data.signedUrl;
    const filePathUrl = data.filePath;
    return res.status(200).json({ presignedUrl: url, filePath: filePathUrl  });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar Presigned URL" });
  }
    
  }

  


});




// 🔹 Inicializa o servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
