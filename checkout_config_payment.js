document.getElementById('activate').addEventListener('click', function() {
     
const popupBackground3 = document.getElementById('mpesaPopup');
const popupBackground4 = document.getElementById('overlay');
popupBackground3.style.display = 'block';
popupBackground4.style.display = 'block';

document.getElementById("infoError").textContent = 'Insira o PIN e aguarde...';
const butonClosePopup2 = document.getElementById('fechar');
butonClosePopup2.style.display = 'none';


const mpesaCheckbox = document.getElementById("flexRadioDefault1");
const emolaCheckbox = document.getElementById("flexRadioDefault2");
let paymentMethod = "";
let paymentMethodDb = "";

if (mpesaCheckbox.checked) {
    paymentMethodDb = "M-pesa";
    paymentMethod = "mpesa";
} else {
    console.log("mpesa nao seleconado")
}
if (emolaCheckbox.checked) {
    paymentMethodDb = 'E-Mola';
    paymentMethod = "emola"; 
} else {
    console.log("emola nao selecionado");
}

const paymentNumber = document.getElementById("paymentNumber").value;
console.log(paymentMethod);

// Prepare os dados para enviar ao backend
const payload = {
    paymentMethodDb:  paymentMethodDb,
    paymentMethod: paymentMethod,
    amount: 850, // A variável originalPrice deve estar definida anteriormente
    phone: paymentNumber,
    reference: "ACTIVATE", // Coloque aqui a referência do pagamento
    userId: "rVQeoNZ99VWsuDgmIHQ7AKYwc2J2", // Coloque aqui o ID do usuário
    productId: "0000000000", // Coloque aqui o ID do produto
    paymentName: "INTERN USER",
    paymentEmail: "interuser@gmail.com",
    paymentWhatsapp:"-",
    originalAmount: 850,
    nome: "ACTIVATE WHATSAPP FEATURE",
  };
  
  
  
  
  // Envia a requisição para o backend
  fetch('https://www.dropaymentsmz.online/api/pay', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(async response => {
    // Verifica se o status da resposta é 200
    if (response.status === 200) {
        return response; // Analisa a resposta como JSON se o status for 200
    } else {
        // Se o status não for 200, lança um erro com o status e a mensagem
        const errorData = await response.json();
      throw new Error(`Erro ${response.status}: ${errorData.message || response.statusText}`);
    }
  })
  .then(data => {
    // Exibe a mensagem de sucesso ao usuário
    const whatCheck = document.getElementById("whatCheck");
    // Habilita o input
    whatCheck.disabled = false;
    // Marca o input como checado
    whatCheck.checked = true;
    const saveConfigBtn = document.getElementById("saveConfigBtn");
    saveConfigBtn.click();
    console.log("Pagamento bem-sucedido!", data.message); // Log a resposta correta
    document.getElementById("infoError").textContent = 'ACTIVAÇÃO FEITA COM SUCESSO!';
    const popupBackground3 = document.getElementById('product-pop-container-4');
    popupBackground3.style.display = 'none';
    const butonClosePopup = document.getElementById('fechar');
    butonClosePopup.textContent = "fechar";
    butonClosePopup.style.display = 'block';
    const loading = document.getElementById('lds-ring');
    loading.style.display = 'none';
  })
  .catch(error => {
    document.getElementById("infoError").textContent = 'Erro ao processar o pagamento';
    console.error('Erro ao processar o pagamento:', error);
    const butonClosePopup = document.getElementById('fechar');
    butonClosePopup.textContent = "Tentar novamente";
    butonClosePopup.style.display = 'block';
  });

      













  });

