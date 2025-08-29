import { addLoadAnim } from "../../animations/index.js";
import { setAnOutPut, pageLoader } from "../../animations/index.js";
import { UserData } from "../../user/v2/userData.js";


export class ProfilePageUtils {
    static formatDate(date) {
        if (!date) return 'N/A';
        if (date) {
            const d = new Date(date);
            const f = (n) => n.toString().padStart(2, '0');
            return `${f(d.getDate())}/${f(d.getMonth() + 1)}/${d.getFullYear()}`;

        }


    }
    static async handleUserData() {
        try {
            const user_data = await UserData.getUserData();

            document.getElementById('user-name').value = user_data.userData.user_info.name || "";
            document.getElementById('user-email').value = user_data.userData.user_info.email || "";
            document.getElementById('user-national-id').value = user_data.userData.user_info.national_id || '';
            document.getElementById('contacto-1').value = user_data.userData.user_info.contact || '';

            pageLoader(false);


        } catch (error) {
            console.error("Erro ao obter UID:", error);
            return error;

        }
    }

    static async saveUserData() {
        try {

            const userData = {
                reqType: 'save/user-data',
                data: {
                    user_id: await UserData.getUserId(),
                    name: $("#user-name").val(),
                    email: $("#user-email").val(),
                    national_id: $("#user-national-id").val(),
                    contact: $("#contacto-1").val(),
                }
            }

            const req = await axios.post('http://localhost:3013/api/v2/live/server', userData);
            console.log(req)
            return req.data

        } catch (error) {
            console.error("Erro ao obter UID:", error);
            return error;

        }
    }

    static limitInputData(id) {
        const input = document.getElementById(id)
        let input_text = input.value.length;
        let text_limit = 100;

        input.addEventListener('input', () => {
            let input_text = input.value.length;
            let text_limit = 200;

            if (input_text >= text_limit) {
                setAnOutPut('Os campos não podem conter mais de 200 caracteres!', 'E-M')
                input.value = '';
                return;
            }
        })
    }

    static async loadPaymentMethod() {
        try {
            const user = await UserData.getUserPayoutMethos();
            const methods = user.payoutMethods;
            console.log(methods.length);

            if (methods.length < 0) {
                console.log('Nenhum metodo de pagamento encontrado!');
                return;
            } else {

                const tbody = document.getElementById('payouts_methods_table');


                methods.forEach((method) => {
                    const tr = document.createElement('tr');
                    const method_id = method.id || 'N/A';

                    const row = `
                    <tr>
                        <td>${method.method_type?.toUpperCase() || 'N/A'}</td>
                        <td>${method.account_holder || 'N/A'}</td>
                        <td>${method.account_id || 'N/A'}</td>
                        <td>${method.bank_name || 'N/A'}</td>
                        <td>${ProfilePageUtils.formatDate(method.created_at) || 'N/A'}</td>
                        <td>
                            <a href="#/edit/payout/method/id=${method_id}" ><i class="bi bi-pencil-square text-[22px]"></i></a>
                            <a href="#/exclude/payout/method/id=${method_id}"><i class="bi bi-trash text-[22px]"></i></a>
                        </td>
                    </tr>`;
                    tr.innerHTML += row;
                    tbody.appendChild(tr);

                });
            }

        } catch (error) {
            console.error("Erro ao obter UID:", error);
            return error;

        }
    }




}



// Chamar a função principal
ProfilePageUtils.handleUserData();

ProfilePageUtils.loadPaymentMethod();






ProfilePageUtils.limitInputData('user-name');

ProfilePageUtils.limitInputData('contacto-1');


document.getElementById('p-save').addEventListener('click', async () => {

    try {
        addLoadAnim('p-save', 'Salvar', true);
        const save_data = await ProfilePageUtils.saveUserData();
        addLoadAnim('p-save', 'Salvar', false);
        console.log(save_data)

        if (save_data.code === '0') {
            setAnOutPut(save_data.message, 'S-M');
        } else {
            setAnOutPut("Erro ao salvar informacoes", 'E-M');
        }
        


    } catch (error) {
        setAnOutPut("Erro ao salvar informacoes", 'E-M');
        console.error(error);
    }


});



