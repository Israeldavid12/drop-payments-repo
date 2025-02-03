import { getUserId } from "../../user/user_data.mjs";
import { addLoadAnim } from "../../animations/index.js";
import { setAnOutPut, pageLoader } from "../../animations/index.js";

export async function handleUserData() {
    try {
        // Aguardar a resposta de getUserId() antes de prosseguir
        const userId = await getUserId();
        console.log("UID do usuário logado:", userId);

        const paymentData = await axios.post('https://www.dropaymentsmz.online/api/balance', {
            userId: userId,
            reqType: 'user_payment_data',
        });
        const fech_data = await axios.post('http://127.0.0.1:3013/api/balance', {
            userId: userId,
            reqType: 'user_data',
        });
        const resData = paymentData.data
        const resData2 = fech_data.data;

        document.getElementById("payment-name").value = resData.data.titular;
        document.getElementById("payment-number").value = resData.data.numero;
        document.getElementById('user-name').value = resData2.user_name;
        document.getElementById('user-email').value = resData2.user_email;
        document.getElementById("tipo-conta").value = resData.data.metodo;
        document.getElementById('contacto-1').value = resData2.contacto_1;
        document.getElementById('contacto-2').value = resData2.contacto_2;

        const selectElement = document.getElementById("tipo-conta");
        const imageElement = document.getElementById("imageELement");
        pageLoader(false);

        selectElement.addEventListener('change', function () {
            // Obtém o valor da opção selecionada
            const selectedValue = selectElement.value;
            if (selectedValue === "M-PESA") {
                imageElement.src = "src/assets/mpesa.png";

            }
            if (selectedValue === "E-MOLA") {
                imageElement.src = "src/assets/emola.png";

            }
            if (selectedValue === "PAYPAL") {
                imageElement.src = "assests/paypal.png";
                document.getElementById("labelNumber").textContent = "Email da conta Paypal *";
                const input = document.getElementById("numero");
                input.placeholder = "Email da conta Paypal *";
                document.getElementById("paypalInfo").style.display = "block";
            }
        });
        console.log(resData);
        // Agora você pode continuar com a lógica que depende do UID
        // Exemplo: buscar dados do usuário com o UID
        // const userData = await fetchUserData(userId); 
        // console.log("Dados do usuário:", userData);

    } catch (error) {
        console.error("Erro ao obter UID:", error);
        return error;

    }
}

// Chamar a função principal
handleUserData();

async function saveData() {

    try {
        const name = document.getElementById("user-name").value;
        const email = document.getElementById("user-email").value;
        const p_name = document.getElementById("payment-name").value;
        const p_number = document.getElementById("payment-number").value;
        const metodo = document.getElementById('tipo-conta').value;
        const contacto_1 = document.getElementById('contacto-1').value;
        const contacto_2 = document.getElementById('contacto-2').value;

        const userId = await getUserId();

        const payload = {
            userId: userId,
            reqType: 'save_user_data',
            name: name,
            email: email,
            p_name: p_name,
            p_number: p_number,
            p_metodo: metodo,
            contacto_1: contacto_1,
            contacto_2: contacto_2
        }
        console.log(payload);
        const response = await axios.post('http://127.0.0.1:3013/api/balance', payload);

        console.log(response.data);

        return response.data;

    } catch (error) {
        return error
    }


}


export function limitInputData(id) {
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

limitInputData('user-name');

limitInputData('payment-name');

limitInputData('payment-number');

limitInputData('contacto-1');

limitInputData('contacto-2');


document.getElementById('p-save').addEventListener('click', async () => {

    try {
        addLoadAnim('p-save', 'Salvar', 4000);


        const save_data = await saveData();

        if (save_data.status) {
            const success = save_data.status;
            setAnOutPut(success, 'S-M');

        } else if (save_data.erro) {
            const erro = save_data.data.erro;
            setAnOutPut(erro, 'E-M')
        } else if (save_data.message) {
            const erro = save_data.message;
            setAnOutPut(erro, 'E-M')
        }



    } catch (error) {
        setAnOutPut(error, 'E-M');
        console.error(error);
    }


});



