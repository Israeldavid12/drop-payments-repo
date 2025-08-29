import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
import { displayMessage } from '../functions.js';
import { addLoadAnim } from '../../../../app/src/animations/index.js';

const supabaseUrl = 'https://ahwujnkfulwgzagshzrl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3VqbmtmdWx3Z3phZ3NoenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTI2NjUsImV4cCI6MjA2MDIyODY2NX0.Yav5nOeVPRQfPXhsSDn0AKvO4w8kFrFvYrV9ChZL5IM'

const supabase = createClient(supabaseUrl, supabaseKey)



class LoginUtils {
    static async updateLastLogin(user_id) {
        try {
            const payload = {
                userId: user_id,
                reqType: "update/last-login"
            }
            const res = await axios.post('http://127.0.0.1:3013/api/v2/live/server', payload)
            console.log(res.data)
            return res.data


        } catch (error) {
            console.log('ERRO AO ATUALIZAR ULTIMO LOGIN: ', error)
            return false

        }
    }

    static async login(email, password) {
        addLoadAnim("authenticator", "Entrar", true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })

            if (error) {
                addLoadAnim("authenticator", "Entrar", false)
                return displayMessage("err", error.message)
            }
            if (data) {
                const update_res = await LoginUtils.updateLastLogin(data.user.id)
                addLoadAnim("authenticator", "Entrar", false)
                displayMessage("success", "Login bem sucedido")
                // console.log(data)
                // console.log(update_res)
                window.location.href = "/app#panel"

            }
        } catch (error) {
            console.error(error)
            addLoadAnim("authenticator", "Entrar", false)
            displayMessage("err", error.message)
        }

    }

    

}









document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(password)

    await LoginUtils.login(email, password);
});





