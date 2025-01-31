import { userData, getUserId } from "../user/user_data.mjs";
import { showAnPopup, addLoadAnim, setAnOutPut } from "../animations/index.js";



const data = await userData();
const balance = data.balance;
const paypalBalance = data.paypalBalance;

const saque_template = `<form class="confirm-w" > <div class="overlay-content">
            <p>Obs: uma vez solicitado nao sera possivel cancelar*</p>
             
            <div class="a-money"  >
                <p>Saldo disponivel (M-pesa/E-mola) <i class="bi bi-credit-card-2-back-fill"></i></p>
                <p>${balance} MT</p>
                 <hr>
                <p>Saldo disponivel (PayPal) <i class="bi bi-paypal"></i></p>
                <p>${paypalBalance} MT</p>
            </div>
            <select id="balance-type" name="opcoes" required>
                <option value="" disabled selected>Selecione uma opção</option>
                <option value="mpesa-emola">M-pesa/e-Mola</option>
                <option value="paypal">Paypal</option>
            </select>
           
            <input id="amount" type="number" placeholder="0.00 MT" required>
            <div class="confirm">
                <input id="checkbox" type="checkbox" name="" id="confirm" required> Confirmar solicitação<br>
            </div>
        <div>
            <button id="b-confirm" class="b-confirm" type= >Solicitar</button>
            <button class="b-cancel" >Cancelar</button>
           
        </div>
         </form>
        </div>`;

document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.w-btn')) {
        addLoadAnim('w-btn', 'Solicitar saque');
        showAnPopup(saque_template, true)
    }
});


document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.b-cancel')) {
        showAnPopup('', false)
    }
});



document.body.addEventListener('submit', async function (event) {
    if (event.target && event.target.matches('.confirm-w')) {
        event.preventDefault();
        addLoadAnim('b-confirm', 'Solicitar');

        const balance_type = document.getElementById('balance-type').value;
        const amount_to_withdraw = document.getElementById('amount').value;
        const checkbox = document.getElementById('checkbox');
        let balance_type_change = '';

        if (!checkbox.checked) {
            setAnOutPut('Por favor, confirme a solicitação!', 'E-M');
        } else {
            let balance_type_change = '';
        
            if (balance_type === 'mpesa-emola') {
                balance_type_change = 'mpesa-emola';
            } else if (balance_type === 'paypal') {
                balance_type_change = 'paypal';
            } else {
                setAnOutPut('Tipo de saldo inválido!', 'E-M');
                return; // Sai da função para evitar requisição errada
            }
        
            try {
                const userId = await getUserId(); // Pegando o ID do usuário
                const response = await axios.post('https://www.dropaymentsmz.online/api/solicitar-saque', {
                    userId: userId,
                    valorSolicitado: amount_to_withdraw,
                    type: balance_type_change
                });
        
                // Verificando o status da resposta
                if (response.status === 200) {
                    setAnOutPut(response.data.message, 'S-M'); // Sucesso
                    showAnPopup('', false)
                } else {
                    setAnOutPut(response.data.message, 'E-M'); // Erro genérico
                    showAnPopup('', false)
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                
                // Tratando erros de resposta do Axios
                if (error.response) {
                    setAnOutPut(error.response.data.message || 'Erro desconhecido.', 'E-M');
                    showAnPopup('', false)
                } else {
                    setAnOutPut('Erro ao conectar ao servidor.', 'E-M');
                    showAnPopup('', false)
                }
            }
        }
        

    }
});