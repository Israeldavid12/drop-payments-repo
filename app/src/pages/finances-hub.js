import { getUserId } from "../user/user_data.mjs";
import { formatBalance } from "../animations/index.js";



async function userData() {
    try {
        const userId = await getUserId();
        const userDataResponse = await axios.post('https://www.dropaymentsmz.online/api/balance', {
            userId: userId,
            reqType: 'user_data',
        });

        const data = userDataResponse.data.data;
        console.log(userDataResponse.data.data.email);
        return {
            name: data.user_name,
            email: data.user_email,
            balance: data.balance,
            paypalBalance: data.paypalBalance
        };

    } catch (error) {
        console.log(error);
    }
}



export async function financeHub() {

    try {
        const userId = await getUserId();
        const userDataResponse = await axios.post('https://www.dropaymentsmz.online/api/balance', {
            userId: userId,
            reqType: 'user_data',
        });

        const data = userDataResponse.data;

        const container = document.createElement('div');
        // const userdata = await userData();
        // console.log(userdata.name);
        const balance = formatBalance(data.balance, "MZN");
        const paypalBalance = formatBalance(data.paypalBalance, "MZN");
        const username = 'Olá, ' + data.user_name;
        const vendasHoje = formatBalance(data.vendasHoje, "MZN");

        const page_data = await axios.get('/app/src/static-pages/finance-hub.html');
        const dataPage = page_data.data;
        
        container.innerHTML = dataPage;
        return container;

    } catch (error) {
        console.log(error);
        return '<h1>404 - Página não encontrada</h1>';
    }

}

