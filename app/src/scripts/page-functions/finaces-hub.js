import { pageLoader } from "../../animations/index.js";
import { userData } from "../../user/user_data.mjs";
import { formatBalance } from "../../animations/index.js";
import loadRender from "../app.js";

const data = await userData();
const balance = Number(data.balance);
const paypalBalance = Number(data.paypalBalance)
const vendasHoje = Number(data.vendasHoje)

document.querySelector('.user_name').textContent = 'Olá, '+data.name;
document.getElementById('mobilePaymentsBalance').textContent = formatBalance(balance, "MZN");
document.getElementById('paypalBalance').textContent = formatBalance(paypalBalance, "MZN");
document.getElementById('sales-today').textContent = formatBalance(vendasHoje, "MZN")
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









