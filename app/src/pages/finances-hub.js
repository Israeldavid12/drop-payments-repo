import { UserData } from '../user/v2/userData.js';
import { formatBalance } from '../animations/index.js';






export async function financeHub() {
    try {
        const container = document.createElement('div');

        const page_data = await axios.get('/app/src/static-pages/finance-hub.html');
        const dataPage = page_data.data;

        container.innerHTML = dataPage;
        return container;

    } catch (error) {
        console.log(error);
        return '<h1>404 - Página não encontrada</h1>';
    }

}

function formatDate(date) {
    if (!date) return 'N/A';
    if (date) {
        const d = new Date(date);
        const f = (n) => n.toString().padStart(2, '0');
        return `${f(d.getDate())}/${f(d.getMonth() + 1)}/${d.getFullYear()} ${f(d.getHours())}:${f(d.getMinutes())}:${f(d.getSeconds())}`;

    }


}


export async function setLastSale() {
    try {
        const tbody_sales = document.getElementById('tbody-sales');

        const user_data = await UserData.getUserData();
        const lastSale = user_data.userData.last_sale;
        console.log(lastSale)

        const amount = formatBalance(Number(lastSale.amount || 0), "MZN")

        const tr = document.createElement('tr');

        const paymentMethod = lastSale.payment_method ? lastSale.payment_method.toLowerCase() : 'N/A';
        console.log(paymentMethod)



        let src_image = '';
        switch (paymentMethod) {
            case "e-mola":
                src_image = 'src/assets/emola.png';
                break;
            case "m-pesa":
                src_image = 'src/assets/mpesa.png';
                break;
            case "paypal":
                src_image = 'src/assets/paypal.png';
                break;
            default:
                src_image = 'src/assets/NA.png';
                break;
        }


        const dataFormatada = formatDate(lastSale.created_at);
        console.log(dataFormatada)

        const template = `<td data-th="Nome do produto:" >${lastSale.product_name || 'N/A'}</td>
                            <td data-th="Montante:" >${amount || 'N/A'}</td>
                            <td data-th="M. de Pagamento:" ><img class="sale-p-image" src="${src_image}" alt="N/A"></td>
                            <td data-th="Nº do Pagamento:" >${lastSale.buyer_phone || "N/A"}</td>
                            <td data-th="Nome:" >${lastSale.buyer_name || "N/A"}</td>
                            <td data-th="Email:" >${lastSale.buyer_email || "N/A"}</td>
                            <td data-th="Phone:" >${lastSale.buyer_phone || "N/A"}</td>
                            <td data-th="Data:" >${dataFormatada || "N/A"}</td>`;
        tr.innerHTML = template;
        tbody_sales.appendChild(tr);

    } catch (error) {
        console.log(error)

    }
}