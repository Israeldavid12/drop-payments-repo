import {userData} from "../user/user_data.mjs";
import { withdrawHistory } from "../user/user_data.mjs";
import { formatBalance } from "./finances-hub.js";
import { setMaxEntries } from "../scripts/app.js";

export const displayBalnace = async () => {
  // Acessando o elemento pelo ID e alterando o texto
  const user = await userData();



  const w_balance = document.getElementById('w-balance');
  if (w_balance) {
    w_balance.innerText = formatBalance(user.balance); // Formatando o saldo
  } else {
    console.error('Elemento com id "w-balance" não encontrado');
  }
}


export const renderWithdrawHistory = async(entries) => {
  let w_array = await withdrawHistory();
  displayBalnace();
  const entries_ = localStorage.getItem('entries');
  console.log(entries_);

  w_array = w_array.slice(0, entries_ || 10);

  const render_container = document.getElementById('tbody');

  render_container.innerHTML = '';

  let metodo_image = '';

  for (let index = 0; index < w_array.length; index++) {
    const withdraws = w_array[index];


    switch (withdraws.metodo) {
      case 'E-MOLA':
        metodo_image = 'src/assets/emola.png';
        break;
      case 'M-PESA':
        metodo_image = 'src/assets/mpesa.png';
        break;
      case 'PAYPAL':
        metodo_image = 'src/assets/paypal.png';
        break;
      default:
        metodo_image = 'src/assets/NA.png';
        break;
    }



    /*const metodo_image = withdraws.metodo === "E-MOLA" ? "../assests/emola.png" :
    withdraws.metodo === "M-PESA" ? "../checkou-assets/mpesa-white.png" : "../assests/paypal.png";*/


    const tr_container = document.createElement('tr');

    const th_rows = `<td data-th="Solicitado a" >${withdraws.timestamp}</td>
    <td data-th="Valor solicitado"  >${formatBalance(withdraws.valueAmount)}</td>
    <td data-th="Valor a receber" >${formatBalance(withdraws.amountPaid)}</td>
    <td data-th="Fee" >MZN 10,00 </td>
    <td data-th="Conta" ><img style="width: 25px; height: 25px; border-radius: 50%;" src="${metodo_image}"></td>
    <td data-th="Estado" >${withdraws.status}</td>
    <td data-th='ID  do saque' >${withdraws.id}</td>`;

    tr_container.innerHTML = th_rows;
    render_container.appendChild(tr_container);
    
  }

  return w_array
}


export default function withdrawPage() {
  const container = document.createElement('div');

  fetch(`/app/src/static-pages/withdraw-hub.html`)
    .then((response) => {
      if (!response.ok) throw new Error('Página não encontrada');
      return response.text();
    })
    .then((html) => {

      container.innerHTML = html;



    })
    .catch(() => {
      return '<h1>404 - Página não encontrada</h1>';
    });

  return container;
}