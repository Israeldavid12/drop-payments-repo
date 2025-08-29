import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { displayMessage } from './functions.js';
import { addLoadAnim } from '../../../app/src/animations/index.js';

const supabaseUrl = 'https://ahwujnkfulwgzagshzrl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3VqbmtmdWx3Z3phZ3NoenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTI2NjUsImV4cCI6MjA2MDIyODY2NX0.Yav5nOeVPRQfPXhsSDn0AKvO4w8kFrFvYrV9ChZL5IM'

const supabase = createClient(supabaseUrl, supabaseKey)





async function saveUserOnDb(name, email, user_id) {

    try {
        const payload = {
            name: name,
            email: email,
            userId: user_id,
            reqType: "save/user"
        }

        const save_response = await axios.post("http://127.0.0.1:3013/api/v2/live/server", payload);
        console.log(save_response.data)
        if (save_response.data.code === "0") {
            return true
        } else {
            return false
        }

    } catch (error) {
        console.log('ERRO AO SALVAR USUARIO: ', error)
        return false

    }
}





async function sendOtp() {
    addLoadAnim("send-otp", "", true)
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
        if (error.response.data.message) {
            displayMessage("err", error.response.data.message)
            addLoadAnim("send-otp", "Enviar", false)
        } else {
            displayMessage("err", "Erro ao enviar o código OTP")
            addLoadAnim("send-otp", "Enviar", false)

        }
    }
}

// Validar OTP
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
        const req = await axios.post("https://www.dropaymentsmz.online/api/v2/live/server", {
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


// Função para login
async function signUpUserOnSupabaseWithEmailAndPassword(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error('Erro ao registrar:', error.message)
            return false
        } else {
            const userId = data.user.id
            console.log('ID do usuário:', userId)
            console.log('Usuário registrado:', data);
            return userId

        }

    } catch (error) {
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

        // Registrar o usuário no Supabase
        const sign_user_id = await signUpUserOnSupabaseWithEmailAndPassword(email, password);
        console.log(sign_user_id)

        if (sign_user_id === false) {
            displayMessage("err", "Erro ao registrar o usuário")
            return false
        } else {
            const res = await saveUserOnDb(name, email, sign_user_id)
            if (res === true) {
                // window.location.href = "/app/#panel";
                console.log("Conta criada com sucesso")
                return true
            } else {
                return false
            }

        }


    } catch (error) {
        console.log(error)
        displayMessage("err", error.code)
        return false
    }


}


document.querySelector(".send-otp").addEventListener('click', async () => {
    await sendOtp()
});

document.querySelector('form').addEventListener('submit', async (event) => {
    addLoadAnim("create-account", "Criar conta", true)
    event.preventDefault();

    if (document.getElementById('termos').checked) {
        const validation = await validateOtp();


        console.log(validation)
        if (validation === true) {
            const create_acc = await createAccount();

            if (create_acc === false) {
                displayMessage("err", "Erro ao criar conta")
            } else {
                displayMessage("success", "Conta criada com sucesso")
            }

        }
        addLoadAnim("create-account", "Criar conta", false)
    } else {
        displayMessage("err", "Você deve aceitar os termos e condições.")
    }
    addLoadAnim("create-account", "Criar conta", false)
});