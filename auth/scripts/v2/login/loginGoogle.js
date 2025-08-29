import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ahwujnkfulwgzagshzrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3VqbmtmdWx3Z3phZ3NoenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTI2NjUsImV4cCI6MjA2MDIyODY2NX0.Yav5nOeVPRQfPXhsSDn0AKvO4w8kFrFvYrV9ChZL5IM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Botão de login com Google
const googleButton = document.getElementById('google-auth');
if (googleButton) {
    googleButton.addEventListener('click', async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://127.0.0.1:5501/auth/login' // ou outro caminho correto
            }
        });
    });
}

// Função que trata o retorno do login (redirecionamento com o "code")
async function handleOAuthRedirect() {
    const { data, error } = await supabase.auth.getSession();

    if (data.session) {
        console.log('Sessão atual:', data.session);
        window.location.href = 'http://127.0.0.1:5501/app#panel';
    } else {
        console.log('Nenhuma sessão ativa encontrada.');
    }

    if (error) {
        console.error('Erro ao obter sessão:', error.message);
        return;
    }
}



handleOAuthRedirect()

