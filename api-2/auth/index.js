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
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// app.use(cors({ credentials: true, origin: "http://localhost:5501" }));

app.use(express.json());
app.use(cookieParser());


const JWT_SECRET = process.env.JWT_SECRET  
console.log(JWT_SECRET)
// 🔹 MIDDLEWARE para autenticação
function autenticar(req, res, next) {
    console.log(req.cookies.token)
    const token = req.cookies.token; // Obtém token do cookie

    if (!token) {
        return res.status(401).json({ error: "Acesso não autorizado" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token inválido ou expirado" });

        req.user = decoded;
        next();
    });
}


// Endpoint para obter a configuração do Firebase
app.post("/api/auth", autenticar, async (req, res) => {
    console.log(req.cookies)
    // console.log(req.body)
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };
    console.log(firebaseConfig)
    
    res.json(firebaseConfig);
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

