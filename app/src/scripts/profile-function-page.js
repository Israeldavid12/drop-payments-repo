import { userPaymentData } from "../user/user_data.mjs";


const user_data = userPaymentData();

setTimeout(() => {
    console.log('data :', user_data);
}, 2000);

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