import { pageLoader } from "../../animations/index.js";
import { userData } from "../../user/user_data.mjs";
import { formatBalance} from "../../pages/finances-hub.js";
import loadRender from "../app.js";

const data = await userData();
const balance = Number(data.balance);
const paypalBalance = Number(data.paypalBalance)
const vendasHoje = Number(data.vendasHoje)


document.getElementById('mobilePaymentsBalance').textContent = formatBalance(balance);
document.getElementById('paypalBalance').textContent = formatBalance(paypalBalance);
document.getElementById('sales-today').textContent = formatBalance(vendasHoje)
document.getElementById('emola').src = '../app/src/assets/emola.png';
document.getElementById('mpesa').src = '../app/src/assets/mpesa.png';
document.getElementById('paypal').src = '../app/src/assets/paypal.png';
pageLoader(false);

document.querySelector('.s_saque').addEventListener('click', () => {
   window.location.hash = '#withdraw';
   
});
document.getElementById('s_saque_2').addEventListener('click', () => {
    window.location.hash = '#withdraw';
 });









