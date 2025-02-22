import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { addLoadAnim } from "../../../app/src/animations/index.js";


const firebaseConfig = {
    apiKey: "AIzaSyDfNNPtqhpG7ShUJo8n89ONoKOq45Xy91w",
    authDomain: "drop-payments-mz.firebaseapp.com",
    databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "drop-payments-mz",
    storageBucket: "drop-payments-mz.appspot.com",
    messagingSenderId: "983262508468",
    appId: "1:983262508468:web:c0a6e26cf8789807b26ee1",
    measurementId: "G-JBP3RN50WS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function displayMessage(type, message) {
    const template = ` <div class="display-message-container" >
     <p>${message}</p>
    </div>`;
    const div = document.createElement("div");

    if (type === "err") {
        const body = document.body;
        div.innerHTML = template;
        body.insertBefore(div, body.firstChild);
        div.style.opacity = '0';
        div.style.visibility = 'hidden';

        // Usa um pequeno timeout para permitir a transição
        setTimeout(() => {
            div.style.opacity = '1';
            div.style.visibility = 'visible';
        }, 120);
        setTimeout(() => {
            document.querySelector(".display-message-container").remove()
        }, 4000)

    }
}


// Função para login
function login(email, password) {
    addLoadAnim("authenticator", "Entrar", true)
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            addLoadAnim("authenticator", "Entrar", false)
            console.log(userCredential.user)
            window.location.href = "/app/";
            console.log('Usuário logado:');
        })
        .catch((error) => {
            displayMessage("err", error.code)
            addLoadAnim("authenticator", "Entrar", false)
        });
}

// Função para login com Google
function loginComGoogle() {
    addLoadAnim("google-auth", "", true)
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            addLoadAnim("google-auth", "", false)
            // Sucesso no login com Google
            const user = result.user;
            console.log('Usuário logado com Google:');
            window.location.href = "/app/";  // Redireciona para a página principal após o login
        })
        .catch((error) => {
            displayMessage("err", error.code)
            addLoadAnim("google-auth", "", false)
        });
}


async function getKeys() {
    try {

        const dataToken = await axios.post("http://127.0.0.1:4000/api/get-token")
        const token = dataToken.data.message
        // axios.defaults.withCredentials = true;
        console.log(token)
        const auth = await axios.post("http://127.0.0.1:3000/api/auth");


    } catch (error) {
        console.error("Erro ao acessar recurso protegido:", error.response.data);
        console.log(error)
    }
}




document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(password)

    login(email, password);
});


// Captura o clique no botão de login com Google
document.querySelector(".google-auth").addEventListener('click', () => {
    loginComGoogle();
});



