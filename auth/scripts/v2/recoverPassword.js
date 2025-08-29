import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { displayMessage } from "./functions.js";
import { addLoadAnim } from '../../../app/src/animations/index.js';



const supabaseUrl = 'https://ahwujnkfulwgzagshzrl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3VqbmtmdWx3Z3phZ3NoenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTI2NjUsImV4cCI6MjA2MDIyODY2NX0.Yav5nOeVPRQfPXhsSDn0AKvO4w8kFrFvYrV9ChZL5IM'

const supabase = createClient(supabaseUrl, supabaseKey)





async function recuperarSenha(email) {
    try {
        addLoadAnim("recover-btn", "Redefinir minha senha", true)
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://127.0.0.1:5501/reset-password/index.html', 
        })

        if (error) {
            console.error('Erro ao enviar e-mail:', error.message)
            displayMessage("err", error.message)
            addLoadAnim("recover-btn", "Redefinir minha senha", false)
        } else {
            console.log('E-mail de redefinição enviado com sucesso!')
            displayMessage("success", "E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.")
            addLoadAnim("recover-btn", "Redefinir minha senha", false)
        }

    } catch (error) {
        console.error("Erro ao recuperar senha:", error);
        displayMessage("err", "Erro ao recuperar senha. Tente novamente mais tarde.");
        addLoadAnim("recover-btn", "Redefinir minha senha", false)

    }
}



document.getElementById('recover-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    console.log(email)
    if (email) {
        await recuperarSenha(email);
    } else {
        displayMessage("err", "Por favor, insira seu e-mail para recuperar a senha.")
    }
});