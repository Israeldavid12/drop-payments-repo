const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
// const authenticateToken = require('./functions/index.js')


const app = express();
// Middleware para permitir CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());
app.use(cors()); // Permitir requisições de outros domínios
app.use(cookieParser());


const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_EXPIRATION = 60 * 60 * 1000; // 1 hora (em milissegundos)


const payload = {
    client_id: "e032bab8-c533-497d-8ff9-324bb477afe2",
    timestamp: new Date().toISOString()
};

// Endpoint para obter a configuração do Firebase
app.post("/api/get-token", async (req, res) => {
    console.log(req.body)
    try {
         // Gera o token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });


    // Armazena o token no cookie seguro 
    res.cookie("token", token,
        {
            httpOnly: true, // Impede acesso via JavaScript (proteção contra XSS)
            secure: false, // Apenas HTTPS (ativa em produção)
            sameSite: "Strict", // Protege contra CSRF
            maxAge: TOKEN_EXPIRATION // Tempo de expiração do token
        }
    );
    console.log(token);

    return res.json({ message: "Token gerado" })
        
    } catch (error) {
        console.log(error)
        return res.json({ message: "Erro ao gerar token" })
        
    }
});




const authenticateToken = (req, res, next) => {
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


app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({ message: "Acesso autorizado!", user: req.user });
});



const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


