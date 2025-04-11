import { userData, getUserId } from "../user/user_data.mjs";
import { showAnPopup, addLoadAnim, setAnOutPut } from "../animations/index.js";



const data = await userData();
const balance = data.balance;
const paypalBalance = data.paypalBalance;

const saque_template = `<form class="confirm-w" > <div class="overlay-content">
            <p>Obs: uma vez solicitado nao sera possivel cancelar*</p>
             
            <div class="a-money"  >
                <p>Saldo disponivel (M-pesa/E-mola) <i class="bi bi-credit-card-2-back-fill"></i></p>
                <p>${parseFloat(balance).toFixed(2)} MT</p>
                 <hr>
                <p>Saldo disponivel (PayPal) <i class="bi bi-paypal"></i></p>
                <p>${parseFloat(paypalBalance).toFixed(2)} MT</p>
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
        addLoadAnim('w-btn', 'Solicitar saque', 2000);
        showAnPopup(saque_template, true)
    }
});


document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.b-cancel')) {
        showAnPopup('', false)
    }
});

document.getElementById('entries').value = localStorage.getItem('entries')
document.getElementById('entries_value').textContent = localStorage.getItem('entries')

document.body.addEventListener('click', function (event) {
    if (event.target && event.target.matches('.apply-filters')) {
        const input_entries = document.getElementById('entries').value
        const entries = sessionStorage.getItem('entries')
        localStorage.setItem('entries', input_entries )
        console.log(localStorage.getItem('entries'))
        location.reload()
    }
});



document.body.addEventListener('submit', async function (event) {
    if (event.target && event.target.matches('.confirm-w')) {
        event.preventDefault();
        addLoadAnim('b-confirm', 'Solicitar', true);

        const balance_type = document.getElementById('balance-type').value;
        const amount_to_withdraw = document.getElementById('amount').value;
        const checkbox = document.getElementById('checkbox');
        let balance_type_change = '';

        if (!checkbox.checked) {
            setAnOutPut('Por favor, confirme a solicitação!', 'E-M');
            addLoadAnim('b-confirm', 'Solicitar', true);
        } else {
            let balance_type_change = '';
        
            if (balance_type === 'mpesa-emola') {
                balance_type_change = 'mpesa-emola';
            } else if (balance_type === 'paypal') {
                balance_type_change = 'paypal';
            } else {
                setAnOutPut('Tipo de saldo inválido!', 'E-M');
                addLoadAnim('b-confirm', 'Solicitar', true);
                return; // Sai da função para evitar requisição errada
            }
        
            try {
                const userId = await getUserId(); // Pegando o ID do usuário
                const response = await axios.post('http://127.0.0.1:3014/api/solicitar-saque', {
                    userId: userId,
                    valorSolicitado: amount_to_withdraw,
                    type: balance_type_change
                });
        
                // Verificando o status da resposta
                if (response.status === 200) {
                    setAnOutPut(response.data.message, 'S-M'); // Sucesso
                    showAnPopup('', false)
                    addLoadAnim('b-confirm', 'Solicitar', true);
                } else {
                    setAnOutPut(response.data.message, 'E-M'); // Erro genérico
                    showAnPopup('', false)
                    addLoadAnim('b-confirm', 'Solicitar', true);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                
                // Tratando erros de resposta do Axios
                if (error.response) {
                    setAnOutPut(error.response.data.message || 'Erro desconhecido.', 'E-M');
                    showAnPopup('', false)
                    addLoadAnim('b-confirm', 'Solicitar', true);
                } else {
                    setAnOutPut('Erro ao conectar ao servidor.', 'E-M');
                    showAnPopup('', false)
                    addLoadAnim('b-confirm', 'Solicitar', true);
                }
            }
        }
        

    }
});