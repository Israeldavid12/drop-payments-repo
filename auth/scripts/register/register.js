// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,  signInWithRedirect  } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
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
const provider = new GoogleAuthProvider();



function displayMessage(type, message) {
    const container = document.querySelector(".display-message-container");

    if (!container) {
        console.error("Elemento .display-message-container não encontrado.");
        return;
    }

    const div = document.createElement("div");
    div.classList.add("message", type === "err" ? "error-message" : "success-message");

    div.innerHTML = `<p>${message}</p>`;
    div.style.opacity = "0";
    div.style.visibility = "hidden";

    container.appendChild(div);

    // Aplica um pequeno delay para ativar a transição
    setTimeout(() => {
        div.style.opacity = "1";
        div.style.visibility = "visible";
    }, 100);

    // Remove a mensagem após 4 segundos
    setTimeout(() => {
        div.style.opacity = "0";
        div.style.visibility = "hidden";
        setTimeout(() => div.remove(), 500); // Remove após a transição
    }, 4000);
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
        const req = await axios.post("http://127.0.0.1:3013/api/v2/live/server", {
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
        const req = await axios.post("http://127.0.0.1:3013/api/v2/live/server", {
            reqType,
            otp,
            email,
        })
        console.log(req)
        displayMessage("success", req.data.message)
        return true
    } catch (error) {
        console.log(error)
        displayMessage("err", "OTP invalido")
        return false
    }
}


document.querySelector(".send-otp").addEventListener('click', async () => {
    await sendOtp()
});


async function saveUser(email, name, userId) {
    try {
        const reqType = "save/user"
        const req = await axios.post("http://127.0.0.1:3013/api/server", {
            reqType,
            email,
            name,
            userId,
        });

        if (req.status === 200) {
            return true
        }

    } catch (error) {
        console.log(error)
        return false
    }
}



// Função para criar uma conta
async function createAccount() {

    try {

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email && !password && !name) {
            return displayMessage("err", "Por favor insira seu endereço de email")
        }
        console.log(name, email, password)

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        const userId = userCredential.user.uid;
        console.log(userId)

        const res = await saveUser(email, name, userId)

        if (res === true) {
            window.location.href = "/app/index.html#panel";
        } else {
            return false
        }

    } catch (error) {
        console.log(error)
        displayMessage("err", error.code)
        return false
    }


}

document.querySelector('form').addEventListener('submit', async (event) => {
    addLoadAnim("create-account", "Criar conta", true)
    event.preventDefault();

    if (document.getElementById('termos').checked) {
        const validation = await validateOtp();

        console.log(validation)
        if (validation === true) {
            await createAccount();

        }
        addLoadAnim("create-account", "Criar conta", false)
    } else {
        displayMessage("err", "Você deve aceitar os termos e condições.")
    }
    addLoadAnim("create-account", "Criar conta", false)
});



async function signUpWithGoogle() {
    try {
        const promise = await signInWithRedirect(auth, provider);
        console.log(promise)
        const user = promise.user;
        const email = user.email;
        const name = user.displayName;
        const userId = user.uid;
        const save = await saveUser(email, name, userId)

        if (save === true) {
            displayMessage("success", "Conta criada com successo")
            window.location.href = "/app/#panel";
        } else {
            return false
        }

    } catch (error) {
        console.log(error);
        displayMessage("err", error.code)
    }

}


document.querySelector(".google-auth").addEventListener("click", async () => {
    addLoadAnim("create-account", "Criar conta", true)
    await signUpWithGoogle()
    addLoadAnim("create-account", "Criar conta", false)
})


