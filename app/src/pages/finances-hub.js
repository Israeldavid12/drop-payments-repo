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
        const userDataResponse = await axios.post('http://127.0.0.1:3013/api/v2/live/server', {
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


export async function setLastSale() {
    try {
        const user_id = await getUserId();
        const response = await axios.post("http://127.0.0.1:3013/api/v2/live/server", {
            reqType: "user_sales",
            userId: user_id,
        });
        let array_sales = response.data.sales;

        const tbody_sales = document.getElementById('tbody-sales');
        const sale = array_sales[6]
        console.log(sale)

        const amountPaid = formatBalance(Number(sale.originalAmount), "MZN")

        const tr = document.createElement('tr');

        let src_image = '';
        switch (sale.paymentMethod) {
            case "E-Mola":
                src_image = 'src/assets/emola.png';
                break;
            case "M-pesa":
                src_image = 'src/assets/mpesa.png';
                break;
            case "PayPal":
                src_image = 'src/assets/paypal.png';
                break;
            default:
                src_image = 'src/assets/NA.png';
                break;
        }

        const template = `<td data-th="Nome do produto:" >${sale.nome || 'N/A'}</td>
                            <td data-th="ID do Produto:" >${sale.id || 'N/A'}</td>
                            <td data-th="Montante:" >${amountPaid || 'N/A'}</td>
                            <td data-th="M. de Pagamento:" ><img class="sale-p-image" src="${src_image}" alt="N/A"></td>
                            <td data-th="Nº do Pagamento:" >${sale.paymentNumber || "N/A"}</td>
                            <td data-th="Nome:" >${sale.paymentName || "N/A"}</td>
                            <td data-th="Email:" >${sale.paymentEmail || "N/A"}</td>
                            <td data-th="WhatsApp:" >${sale.paymentWhatsapp || "N/A"}</td>
                            <td data-th="Data:" >${sale.timestamp || "N/A"}</td>`;
        tr.innerHTML = template;
        tbody_sales.appendChild(tr);

    } catch (error) {
        console.log(error)

    }
}