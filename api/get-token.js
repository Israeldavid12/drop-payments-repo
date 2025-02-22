const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");


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
    client_id: "e032bab8-c533-497d-8ff9-324bb477afe2"
};

// Endpoint para obter a configuração do Firebase
app.post("/api/get-token", async (req, res) => {
    console.log(req.body)
    // Gera o token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

   
    // // Armazena o token no cookie seguro 
     res.cookie("token", token
        // {
    //     // httpOnly: true, // Impede acesso via JavaScript (proteção contra XSS)
    //     // secure: false, // Apenas HTTPS (ativa em produção)
    //     // sameSite: "Strict", // Protege contra CSRF
    //     // maxAge: TOKEN_EXPIRATION // Tempo de expiração do token
    // }
    );
    console.log(token);

    res.json({ message: "Token gerado"})
});



const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


