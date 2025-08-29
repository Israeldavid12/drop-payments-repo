// SET AN OUTPUT

export function displayMessage(type, message) {
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



// SEND OTP
export async function sendOtp(email) {
    addLoadAnim("send-otp", "Enviar", true)
    if (!email) {
        addLoadAnim("send-otp", "Enviar", false)
        return displayMessage("err", "Por favor insira seu endereço de email")
    }
    try {
        const reqType = "otp/code";
        const req = await axios.post("https://www.dropaymentsmz.online/api/v2/live/server", {
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


export async function saveUserOnDb(name, email, user_id) {

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

