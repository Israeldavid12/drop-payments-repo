const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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





function urlToRelativePath(url) {
  // Regex para remover parâmetros de consulta
  const path = url.split('?')[0]; // Retira a parte depois do "?"

  // Extrai o caminho após "o/" e decodifica caracteres especiais
  const relativePath = path.replace("https://firebasestorage.googleapis.com/v0/b/drop-payments-mz.appspot.com/o/", "");

  return decodeURIComponent(relativePath); // Decodifica espaços e outros caracteres especiais
}


const convertCurrency = async (price_geted, type) => {
  if (type === "MZN-BRL") {
    const apiUrl = `https://v6.exchangerate-api.com/v6/9839a325e7590a117270a4d8/latest/BRL`;
    const brl_currency = await axios.get(apiUrl)
    console.log(brl_currency.data.conversion_rates.MZN)
    const brl_exhanged = Number(brl_currency.data.conversion_rates.MZN)
    const result = parseFloat((price_geted / brl_exhanged).toFixed(2))
    console.log(result)
    return {
      result: result,
      c_rate: brl_exhanged
    }
  } else if (type === "MZN-USD") {
    const apiUrl = `https://v6.exchangerate-api.com/v6/9839a325e7590a117270a4d8/latest/USD`;
    const brl_currency = await axios.get(apiUrl)
    console.log(brl_currency.data.conversion_rates.MZN)
    const brl_exhanged = Number(brl_currency.data.conversion_rates.MZN)
    const result = parseFloat((price_geted / brl_exhanged).toFixed(2))
    console.log(result)
    return {
      result: result,
      c_rate: brl_exhanged
    }
  }
  else if (type === "MZN-ZAR") {
    const apiUrl = `https://v6.exchangerate-api.com/v6/9839a325e7590a117270a4d8/latest/ZAR`;
    const brl_currency = await axios.get(apiUrl)
    console.log(brl_currency.data.conversion_rates.MZN)
    const brl_exhanged = Number(brl_currency.data.conversion_rates.MZN)
    const result = parseFloat((price_geted / brl_exhanged).toFixed(2))
    console.log(result)
    return {
      result: result,
      c_rate: brl_exhanged
    }
  }

}

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


module.exports = { urlToRelativePath, convertCurrency, generatePresignedUrl };