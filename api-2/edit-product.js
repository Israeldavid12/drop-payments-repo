const express = require("express");
const admin = require("firebase-admin");
const multer = require("multer");
const bodyParser = require("body-parser");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
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
    storageBucket: "drop-payments-mz.appspot.com", // Adicione esta linha!
});

const db = admin.database();
const fb_firestore = admin.firestore();
const storage = admin.storage();
const app = express();
const bucket = admin.storage().bucket();

app.use(bodyParser.json());

// 🔹 Configuração do Multer (Memória, sem salvar localmente)
// const upload = multer({ storage: multer.memoryStorage() });

// 🔹 Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function urlToRelativePath(url) {
    // Regex para remover parâmetros de consulta
    const path = url.split('?')[0]; // Retira a parte depois do "?"

    // Extrai o caminho após "o/" e decodifica caracteres especiais
    const relativePath = path.replace("https://firebasestorage.googleapis.com/v0/b/drop-payments-mz.appspot.com/o/", "");

    return decodeURIComponent(relativePath); // Decodifica espaços e outros caracteres especiais
}

// **Rota de Upload**
app.post("/api/edit-product", async (req, res) => {

        try {
            const { userId, product_name, product_price, old_image_url, new_image_url, product_id } = req.body;

            // if (!req.files || !req.files["new_product_image"]) {
            //     return res.status(400).json({ message: "Nenhum arquivo selecionada." });
            // }
            console.log(req.body)

            const image = String(old_image_url);

            if (image.includes('firebasestorage')) {

                const relativePath = urlToRelativePath(image);

                await bucket.file(relativePath).delete();
                console.log(`Arquivo "${relativePath}" excluído com sucesso.`);

                // const file = req.files.new_product_image[0]; // Array de arquivos
                // const fileStream = file.buffer;  // O arquivo está na memória
                // const fileName = `uploads/images/${Date.now()}-${file.originalname}`;  // Salva product_image em uploads/images

                // console.log(fileName)

                // // Configuração para o upload para o R2
                // const params = {
                //     Bucket: process.env.CLOUDFLARE_R2_BUCKET,
                //     Key: fileName,
                //     Body: fileStream, // Arquivo em memória
                //     ContentType: file.mimetype,
                // };

                // await s3.send(new PutObjectCommand(params));

                // const fileUrl = `https://megaofertasco.store/${fileName}`;

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


                // const file = req.files.new_product_image[0]; // Array de arquivos
                // const fileStream = file.buffer;  // O arquivo está na memória
                // const fileName = `uploads/images/${Date.now()}-${file.originalname}`;  // Salva product_image em uploads/images

                // console.log(fileName)


                // // Configuração para o upload para o R2
                // const params = {
                //     Bucket: process.env.CLOUDFLARE_R2_BUCKET,
                //     Key: fileName,
                //     Body: fileStream, // Arquivo em memória
                //     ContentType: file.mimetype,
                // };

                // await s3.send(new PutObjectCommand(params));

                // const fileUrl = `https://megaofertasco.store/${fileName}`;

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
);


// Inicializa o servidor
app.listen(3001, () => console.log("Servidor rodando na porta 3001"));
