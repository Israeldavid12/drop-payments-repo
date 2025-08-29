import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ahwujnkfulwgzagshzrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3VqbmtmdWx3Z3phZ3NoenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTI2NjUsImV4cCI6MjA2MDIyODY2NX0.Yav5nOeVPRQfPXhsSDn0AKvO4w8kFrFvYrV9ChZL5IM';

const supabase = createClient(supabaseUrl, supabaseKey);



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


const googleButton = document.getElementById('google-auth-register');
if (googleButton) {
    console.log("BOTAO GOOGLE ENCONTRADO")
    googleButton.addEventListener('click', async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://127.0.0.1:5501/auth/register' // ou outro caminho correto
            }
        });
    });
}

// Função que trata o retorno do login (redirecionamento com o "code")
async function handleOAuthRedirecAfterRegister() {
    const { data, error } = await supabase.auth.getSession();

    if (data.session) {
        console.log('Usuario logado:');

        const user_id = data.session.user.id
        const user_email = data.session.user.email
        const user_name = data.session.user.user_metadata.full_name

        const saveUser = await saveUserOnDb(user_name, user_email, user_id)

        if (saveUser === true) {
            console.log("Usuario salvo com sucesso");
            window.location.href = 'http://127.0.0.1:5501/app#panel';
        } else {
            console.log("Erro ao salvar usuario no banco de dados")
            return false
        }


    } else {
        console.log('Nenhuma sessão ativa encontrada.');
    }

    if (error) {
        console.error('Erro ao obter sessão:', error.message);
        return;
    }
}

console.log("INICIANDO O LOGIN COM GOOGLE")
setTimeout(async () => {
    await handleOAuthRedirecAfterRegister()
})

