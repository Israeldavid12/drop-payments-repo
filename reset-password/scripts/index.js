import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


const supabaseUrl = 'https://ahwujnkfulwgzagshzrl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3VqbmtmdWx3Z3phZ3NoenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTI2NjUsImV4cCI6MjA2MDIyODY2NX0.Yav5nOeVPRQfPXhsSDn0AKvO4w8kFrFvYrV9ChZL5IM'
const supabase = createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
console.log(accessToken)

document.getElementById("reset-password-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const newPassword = document.getElementById("new-password").value;
    const urlFragment = new URLSearchParams(window.location.hash);
    const accessToken = urlFragment.get('access_token');
    console.log(accessToken)

    if (!newPassword) {
        displayMessage("err", "Por favor, insira uma nova senha.");
        return;
    }

    if (!accessToken) {
        displayMessage("err", "Token de acesso inválido.");
        return;
    }

    try {
        // Redefinir a senha do usuário
        const { data, error } = await supabase.auth.api.updateUser(accessToken, {
            password: newPassword,
        });

        if (error) {
            displayMessage("err", error.message);
        } else {
            displayMessage("success", "Senha redefinida com sucesso.");
            // Redireciona para a página de login ou outras ações
            window.location.href = "/login";
        }
    } catch (error) {
        displayMessage("err", "Erro ao redefinir a senha.");
        console.error(error);
    }
});

function displayMessage(type, message) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    if (type === "err") {
        messageElement.style.color = "red";
    } else {
        messageElement.style.color = "green";
    }
}
