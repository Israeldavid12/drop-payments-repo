import { getUserId } from "../user/user_data.mjs";
import { formatBalance } from "./finances-hub.js";



async function displaySales() {
    try {
        const user_id = await getUserId();
        const response = await axios.post("http://127.0.0.1:3013/api/balance", {
            reqType: "user_sales",
            userId: user_id,
        });
        let array_sales = response.data.sales.reverse();
        array_sales = array_sales.slice(0, 3)

        const tbody_sales = document.getElementById('tbody-sales');

        tbody_sales.innerHTML = '';

        for (let c = 0; c < array_sales.length; c++) {
            
            const sale = array_sales[c]
            // console.log(sale)

            const amountPaid = formatBalance(Number(sale.originalAmount))

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

         const template  = `<td data-th="Nome do produto:" >${sale.nome || 'N/A'}</td>
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


        }

    } catch (error) {
        console.log(error);

    }
}

displaySales()


export async function salesPage() {
    const page = await axios.get("src/static-pages/vendas-hub.html")
    const container = document.createElement('div');
    container.innerHTML = page.data
    return container
}