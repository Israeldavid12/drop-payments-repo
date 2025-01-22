import { getUserId } from "../user/user_data.mjs";



export async function handleUserData() {
    try {
        // Aguardar a resposta de getUserId() antes de prosseguir
        const userId = await getUserId();
        console.log("UID do usuário logado:", userId);

        const paymentData = await axios.post('https://www.dropaymentsmz.online/api/balance', {
            userId: userId,
            reqType: 'user_payment_data',
        });
        const fech_data = await axios.post('https://www.dropaymentsmz.online/api/balance', {
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

        const selectElement = document.getElementById("tipo-conta");
        const imageElement = document.getElementById("imageELement");

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
    }
}

// Chamar a função principal
// handleUserData();




