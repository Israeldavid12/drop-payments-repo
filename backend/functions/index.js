const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

require("dotenv").config();
const jwt = require("jsonwebtoken");



const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const JWT_SECRET = process.env.JWT_SECRET


class Utils {
  static urlToRelativePath(url) {
    // Regex para remover parâmetros de consulta
    const path = url.split('?')[0]; // Retira a parte depois do "?"

    // Extrai o caminho após "o/" e decodifica caracteres especiais
    const relativePath = path.replace("https://firebasestorage.googleapis.com/v0/b/drop-payments-mz.appspot.com/o/", "");

    return decodeURIComponent(relativePath); // Decodifica espaços e outros caracteres especiais
  }

  static convertCurrency = async (price_geted, type) => {
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

  static async generatePresignedUrl(fileName, contentType, dir_file) {
    const id = uuidv4()
    const filePath = `uploads/${dir_file}/${id}-${fileName}`
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: filePath,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // Expira em 1 hora
    return {
      signedUrl: signedUrl,
      filePath: filePath,
    };
  }


  static authenticateToken = (req, res, next) => {
    const token = req.cookies.token; // Obtém o token do cookie
    console.log('Token obtido: ', token)

    if (!token) {
      return res.status(401).json({ error: "Acesso não autorizado. Token ausente." });
    }

    try {
      // Verifica e decodifica o token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Adiciona os dados do usuário na requisição
      next(); // Continua para o próximo middleware/rota
    } catch (error) {
      return res.status(403).json({ error: "Token inválido ou expirado." });
    }
  };


  static getDate(data = new Date()) {
    // Extrai dia, mês, ano, horas, minutos e segundos
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');

    // Formata no padrão DD/MM/AAAA HH:MM:SS
    return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
  }




}








module.exports = { Utils };