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



// Função para recuperação de senha
function recuperarSenha(email) {
    addLoadAnim("recover-btn", "Redefinir minha senha", true)
    sendPasswordResetEmail(auth, email)
        .then(() => {
            addLoadAnim("recover-btn", "Redefinir minha senha", false)
            displayMessage("err","E-mail de recuperação enviado. Verifique sua caixa de entrada.")

        })
        .catch((error) => {
            addLoadAnim("recover-btn", "Redefinir minha senha", false)
            displayMessage("err", error.code)
        });
} 
 
 
 
 
document.getElementById('recover-btn').addEventListener('click', () => {
     const email = document.getElementById('email').value;
     if (email) {
         recuperarSenha(email);
     } else {
        displayMessage("err", "Por favor, insira seu e-mail para recuperar a senha.")
     }
 });