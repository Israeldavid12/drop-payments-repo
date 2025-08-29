import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { setAnOutPut } from "../../animations/index.js";


const supabaseUrl = 'https://ahwujnkfulwgzagshzrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod3VqbmtmdWx3Z3phZ3NoenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2NTI2NjUsImV4cCI6MjA2MDIyODY2NX0.Yav5nOeVPRQfPXhsSDn0AKvO4w8kFrFvYrV9ChZL5IM';

const supabase = createClient(supabaseUrl, supabaseKey)



export class UserData {
    static async getUserId() {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
            console.error('Erro ao obter o ID do usuário:', error.message)
            setAnOutPut(error.message, 'E-M')
            return null
        } else {
            console.log('ID do usuário:', user.id)
            return user.id
        }
    }

    static async logout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Erro ao fazer logout:', error.message);
            setAnOutPut(error.message, 'E-M')
        } else {
            console.log('Logout feito com sucesso!');
            window.location.href = '/auth/login/'
        }

    }


    static async getUserData() {

        try {
            const userId = await UserData.getUserId();
            const payload = {
                userId: userId,
                reqType: "get/user-data"
            }

            const req = await axios.post('http://localhost:3013/api/v2/live/server', payload);
            console.log(req.data)
            const name = req.data.userData.user_info.name;
            const email = req.data.userData.user_info.email;
            sessionStorage.setItem('name', name);
            sessionStorage.setItem('email', email);
            const firstLetter = name.charAt(0).toUpperCase();
            document.getElementById('open_user_menu').textContent = firstLetter;
            return req.data

        } catch (error) {
            console.error('Erro ao obter os dados do usuário:', error.message)
            setAnOutPut(error.message, 'E-M')
            return null

        }

    }

    static async getUserPayoutMethos() {
        try {
            const userId = await UserData.getUserId();
            const payload = {
                userId: userId,
                reqType: "get/payout_methods"
            }

            const req = await axios.post('http://localhost:3013/api/v2/live/server', payload);
            console.log(req.data)
            return req.data

        } catch (error) {
            console.error('Erro ao obter os dados do usuário:', error.message)
            setAnOutPut(error.message, 'E-M')
            return null

        }

    }


    static async deleleData(id, table, return_hash) {
         try {
            const payload = {
                id: id,
                table: table,
                reqType: 'delete/user-data'
            }
            const req = await axios.post('http://localhost:3013/api/v2/live/server', payload);
            console.log(req.data)
            if (req.data) {
                setAnOutPut(req.data.status, 'S-M');
                window.location.hash = return_hash
            } 


         } catch (error) {
             console.error('Erro ao obter os dados do usuário:', error.message)
             setAnOutPut(error.message, 'E-M')
             return null

         }
    }

    static async updateData(id, table, data, return_hash) {
        try {
            const payload = {
                id: id,
                table: table,
                data: data
            }
            const req = await axios.post('http://localhost:3013/api/v2/live/server', payload);
            console.log(req.data)
            if (req.data) {
                setAnOutPut(req.data.status, 'S-M');
                window.location.hash = return_hash
            } 


        } catch (error) {
            console.error('Erro ao obter os dados do usuário:', error.message)
            setAnOutPut(error.message, 'E-M')
            return null

        }
    }

    static async setPayoutMethod(id) {
        try {
            const payload = {
                id: id,
                reqType: 'get/payout-method'
            }
            const req = await axios.post('http://localhost:3013/api/v2/live/server', payload);
            console.log(req.data) 
            const payout = req.data.payoutMethod;
            $("#account_holder").val(payout.account_holder).change();
            $("#account_id").val(payout.account_id).change();
            
            return req.data
            


        } catch (error) {
            console.error('Erro ao obter os dados do usuário:', error.message)
            return null

        }
    }

    static async getProducts() {
        try {
            const payload = {
                userId: await UserData.getUserId(),
                reqType: 'get/user-products'
            }
            const request = await axios.post('http://127.0.0.1:3013/api/v2/live/server', payload)
            if (request.data) {
                console.log(request.data)
                return request.data.products
            }
            
        } catch (error) {
            console.log(error)
            
        }
    }


}