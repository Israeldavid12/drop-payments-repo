import { pageLoader } from "../../animations/index.js";
import { UserData} from "../../user/v2/userData.js";
import { formatBalance } from "../../animations/index.js";
import loadRender from "../app.js";

const data = await UserData.getUserData();


const balance = Number(data.userData.user_info.primary_balance);
const paypalBalance = Number(data.userData.user_info.secundary_balance);
const vendasHoje = Number(data.userData.user_info.sales_today);

document.querySelector('.user_name').textContent = 'Olá, '+data.userData.user_info.name.split(' ')[0]+'!';
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









