// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { addLoadAnim } from "../../../app/src/animations/index.js";


// Your web app's Firebase configuration
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
const database = getDatabase(app);
const provider = new GoogleAuthProvider();



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
    if (type === "success") {
        const body = document.body;
        div.innerHTML = template;
        body.insertBefore(div, body.firstChild);
        div.style.opacity = '0';
        div.style.visibility = 'hidden';
        document.querySelector(".display-message-container").style.backgroundColor = "#00a82a";

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

async function sendOtp() {
    addLoadAnim("send-otp", "Enviar", true)
    const email = document.getElementById("email").value
    if (!email) {
        addLoadAnim("send-otp", "Enviar", false)
        return displayMessage("err", "Por favor insira seu endereço de email")
    }
    try {
        const reqType = "otp/code";
        const req = await axios.post("http://127.0.0.1:3013/api/server", {
            reqType,
            email,
        })
        console.log(req.data)
        if (req.data.code === "0") {
            displayMessage("success", req.data.message)
        }
        addLoadAnim("send-otp", "Enviar", false)
    } catch (error) {
        console.log(error)
        displayMessage("err", error.response)
        addLoadAnim("send-otp", "Enviar", false)
    }
}
async function validateOtp() {
    try {
        const email = document.getElementById("email").value
        if (!email) {
            return displayMessage("err", "Por favor insira seu endereço de email")
        }
        const otp = document.getElementById("otp-code").value;
        if (!otp) {
            return displayMessage("err", "Por favor insira o codigo OTP")
        }
        const reqType = "verifyOtp"
        const req = await axios.post("http://127.0.0.1:3013/api/server", {
            reqType,
            otp,
            email,
        })
        console.log(req)
        displayMessage("success", req.data.message)
    } catch (error) {
        console.log(error)
        displayMessage("err", "Erro interno do servidor")
    }
}


document.querySelector(".send-otp").addEventListener('click', async () => {
    await sendOtp()
});

document.querySelector(".authenticator").addEventListener("click", async () => {
    await validateOtp()
});



// Função para criar uma conta
function createAccount(email, password, name) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Salva o nome do usuário no Realtime Database
            set(ref(database, 'users/' + user.uid), {
                name: name,
                email: email
            }).then(() => {
                const userId_registered = user.uid;
                const url_parms = new URLSearchParams(window.location.search);
                const affId = url_parms.get('affId');
                const affId_user = { affId, userId_registered };
                fetch('https://www.mozbuyit.store/api/affiliates/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(affId_user)
                }).then(response => response.json()
                ).then(data => {
                    if (data.estado === 'credited') {
                        console.log(data.message)
                    }
                }).catch((error) => {
                    console.log('erro: ', error);
                });
                submeter.textContent = "Conta criada e nome salvo com sucesso!";
                window.location.href = "index.html";
            }).catch((error) => {
                submeter.textContent = "Criar minha conta";
                console.error('Erro ao salvar o nome no Database:', error);
            });
        })
        .catch((error) => {
            submeter.textContent = "Criar minha conta";
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Erro ao criar conta:', errorCode, errorMessage);
            alert('Erro: ' + errorMessage);
        });
}

// Função de criação de conta com Google
function signUpWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;

            // Salva o usuário no banco de dados caso ele seja novo
            set(ref(database, 'users/' + user.uid), {
                name: user.displayName,
                email: user.email
            }).then(() => {
                submeter.textContent = "Conta criada com Google!";
                window.location.href = "index.html";
            }).catch((error) => {
                console.error('Erro ao salvar dados do usuário Google:', error);
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Erro na criação de conta com Google:', errorCode, errorMessage);
            alert('Erro: ' + errorMessage);
        });
}

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    /*if (document.getElementById('termos').checked) {
        createAccount(email, password, name);
        submeter.textContent = "Criando conta, aguarde...";
    } else {
        alert('Você deve aceitar os termos e condições.');
    } */
});

// // Adiciona o evento ao botão de login com Google
// const googleLoginBtn = document.getElementById('google-signup');

// googleLoginBtn.addEventListener('click', () => {
//     document.getElementById('output').textContent = 'Criacao de conta interdita!';
// });

