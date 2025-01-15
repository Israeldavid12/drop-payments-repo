function getQueryParams2() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let match;
    while (match = regex.exec(queryString)) {
        params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
    }
    return params;
}

document.getElementById('pay-btn').addEventListener('click', function() {
    event.preventDefault();  // Impede o envio do formulário da forma tradicional

    document.getElementById("infoError").innerText = "Insira o PIN e aguarde...";

    document.getElementById("fechar").style.display = "none";
  
    const nameContainer = document.getElementById('divnome');
    const emailContainer = document.getElementById('divemail');
    const whatsappContainer = document.getElementById('divwhatsapp');
    const priceContainer = document.getElementById('divpriceInserted');
    const inputOutputName = document.getElementById('inputoutputNome');
    const inputOutputEmail = document.getElementById('inputoutputEmail');
    const inputOutputWhasapp = document.getElementById('inputoutputWhatsapp');
    const inputOutputPrice = document.getElementById('inputoutputPrice');
  
      // Verifica se o campo "Nome" está visível (display: block) e vazio
      if (window.getComputedStyle(nameContainer).display === 'flex' && !document.getElementById('nome').value) {
        inputOutputName.style.display = "block";
        inputOutputName.textContent = "O campo Nome é obrigatório.";
        const position = nameContainer.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: position, behavior: 'smooth' }); // Rolagem suave até a posição do elemento
        return; // Interrompe a execução
    }
  
    // Verifica se o campo "Email" está visível (display: block) e vazio
    if (window.getComputedStyle(emailContainer).display === 'flex' && !document.getElementById('email').value) {
        inputOutputEmail.style.display = "block";
        inputOutputEmail.textContent = "O campo Email é obrigatório.";
        const position = emailContainer.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: position, behavior: 'smooth' }); // Rolagem suave até a posição do elemento
        return; // Interrompe a execução
    } 


     // Verifica se o campo "Email" está visível (display: block) e vazio
     if (window.getComputedStyle(whatsappContainer).display === 'flex' && !document.getElementById('whatsapp').value) {
        inputOutputWhasapp.style.display = "block";
        inputOutputWhasapp.textContent = "O campo whatsapp é obrigatório.";
        const position = emailContainer.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: position, behavior: 'smooth' }); // Rolagem suave até a posição do elemento
        return; // Interrompe a execução
    }
  
  
   
    if (window.getComputedStyle(priceContainer).display === 'flex' && !document.getElementById('priceInserted').value) {
      inputOutputPrice.style.display = "block";
      inputOutputPrice.textContent = "Por favor insira o montante a pagar.";
      const position = priceContainerContainer.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: position, behavior: 'smooth' }); // Rolagem suave até a posição do elemento
      return; // Interrompe a execução
  }
  
  
  
  
    const payBtn = document.getElementById('pay-btn');
    const paymentNumber = document.getElementById('paynumber').value;
    const paymentName = document.getElementById('nome').value;
    const paymentEmail = document.getElementById('email').value;
    const paymentWhatsapp = document.getElementById('whatsapp').value;
    const price = parseFloat(document.getElementById('productPrice').textContent);
    const inputOutput = document.getElementById('inputoutput');
    console.log(price);
   
    payBtn.textContent = "Processando...";
  
    // Verifica se o campo paymentNumber está vazio
    if (!paymentNumber) {
      inputOutput.textContent = ' campo do número de pagamento está vazio.';
      inputOutput.style.display = 'block';
      console.error('O campo do número de pagamento está vazio.');
      payBtn.textContent = "Proceder Pagamento";  // Volta o texto do botão para o original
      inputOutputEmail.textContent = "O campo Email é obrigatório.";
      return;
    }
  
    // Verifica se o número de pagamento possui exatamente 9 caracteres
    if (paymentNumber.length !== 9) {
      inputOutput.textContent = 'O número de pagamento deve ter exatamente 9 dígitos.';
      inputOutput.style.display = 'block';
      console.error('O número de pagamento deve ter exatamente 9 dígitos.');
      payBtn.textContent = "Proceder Pagamento";  // Volta o texto do botão para o original
      inputOutputEmail.textContent = "O campo Email é obrigatório.";
      return;
    }
  
    // Determina o método de pagamento com base na cor do botão
    let paymentMethod = "";
    let paymentMethodDb = "";
  
    const buttonColor = window.getComputedStyle(payBtn).backgroundColor;
  
    // Verifica se o método de pagamento é M-pesa ou E-mola
    if (buttonColor === 'rgb(255, 0, 0)' || buttonColor === 'rgb(183, 28, 28)') { // M-pesa
      paymentMethodDb = "M-pesa";
      paymentMethod = "mpesa"; // Define o método de pagamento como "mpesa"
  
      // Verifica se o número começa com 84 ou 85
      if (!(paymentNumber.startsWith('84') || paymentNumber.startsWith('85'))) {
        inputOutput.textContent = 'O número de M-pesa deve começar com 84 ou 85.';
        inputOutput.style.display = 'block';
        console.error('O número de M-pesa deve começar com 84 ou 85.');
        payBtn.textContent = "Proceder Pagamento";  // Volta o texto do botão para o original
        inputOutputEmail.textContent = "O campo Email é obrigatório.";
        return;
      }
  
      displayPaymentPopup('../assests/mpesa.jpg', 'red');
  
    } else { // E-Mola
      paymentMethodDb = 'E-Mola';
      paymentMethod = "emola"; // Define o método de pagamento como "emola"
  
  
      // Verifica se o número começa com 86 ou 87
      if (!(paymentNumber.startsWith('86') || paymentNumber.startsWith('87'))) {
        inputOutput.textContent = 'O número de E-mola deve começar com 86 ou 87.';
        inputOutput.style.display = 'block';
        console.error('O número de E-mola deve começar com 86 ou 87.');
        payBtn.textContent = "Proceder Pagamento";  // Volta o texto do botão para o original
        return;
      }
  
      displayPaymentPopup('../assests/emola.png', '#FA742C');
    }
   























    const amountPaid = document.getElementById("productPrice").textContent; // Corrigido o nome da variável
    const whatsappBuyer = document.getElementById("whatsapp").value;
    const quantity = document.getElementById("quantidade").value;
    const nameBuyer = document.getElementById("nome").value;
    const emailBuyer = document.getElementById("email").value;
    const adress = document.getElementById("adress").value;
    const orderId = new Date().getTime().toString();
    
    // Obter parâmetros da URL
    const params = getQueryParams2(); 
    
    function sanitizeProductName(produto) {
        // Converte productName em string, se não for uma
        produto = String(produto);
    
        // Remove caracteres que não são letras e números
        const sanitized = produto.replace(/[^a-zA-Z0-9]/g, '');
    
        // Limita o tamanho a 25 caracteres
        return sanitized.substring(0, 25);
    }
    
    const produto =  document.getElementById("productName").textContent;
    const cleanProductName = sanitizeProductName(produto);
    console.log(cleanProductName); // Saída: ProdutoExemplo123
    
      
    
    
    
    
    
    const name = document.getElementById('productName').textContent;
    console.log(price);
    
    
    // Prepare os dados para enviar ao backend
    const payload = {
      paymentMethodDb:  paymentMethodDb,
      paymentMethod: paymentMethod,
      amount: price, // A variável originalPrice deve estar definida anteriormente
      phone: paymentNumber,
      reference: cleanProductName, // Coloque aqui a referência do pagamento
      userId: params.client_id, // Coloque aqui o ID do usuário
      productId: params.variantId, // Coloque aqui o ID do produto
      paymentName: paymentName,
      paymentEmail: paymentEmail,
      paymentWhatsapp: paymentWhatsapp,
      originalAmount: price,
      nome: name,
      productName: params.productName, // Verifica se o parâmetro existe
      storeName: params.storeName, // Verifica se o parâmetro existe
      amountPaid: amountPaid,
      whatsappBuyer: whatsappBuyer,
      quantity: quantity,
      nameBuyer: nameBuyer,
      emailBuyer: paymentEmail,
      emailSeller: params.email_seller,
      adress: adress,
      orderId: orderId,
    };
    
    console.log(payload);
    
    
    // Envia a requisição para o backend
    fetch('http://127.0.0.1:4000/api/pay-shopify', {
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
      console.log("Pagamento bem-sucedido!", data.message); // Log a resposta correta
      document.querySelector('.imagePopup').style.display = "none";
      document.getElementById("sucessPayment").style.display = "block";
      document.getElementById("infoError").innerText = "Pedido pago com sucesso!";
      
      setTimeout(function() {
        window.location.href = params.storeUrl;
    }, 4000);
    })
    .catch(error => {
      handlePaymentError(error);
      console.log('handlePaymentUsing() end with errors #108...');
      console.error('Erro ao processar o pagamento:', error);
    
    });







    



});











// Function to display the payment popup
function displayPaymentPopup(imageSrc, color) {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('mpesaPopup').style.display = 'block';
    document.querySelector('.imagePopup').src = imageSrc;
    document.getElementById('infoError').style.color = color;
  
    const allLdsRingDivs = document.querySelectorAll('.lds-ring div');
    allLdsRingDivs.forEach(div => {
      div.style.borderColor = `${color} transparent transparent transparent`;
    });
  }



// Function to handle payment errors
function handlePaymentError(errorMessage) {
    document.getElementById("infoError").innerText = "ERRO AO CONCLUIR O PAGAMENTO! \n POR FAVOR TENTE NOVAMENTE";
    console.error("Payment Failed:", errorMessage);
    
    //const showhelp = document.getElementById("help");
    //const showhelp1 = document.getElementById("supportEmail");
    document.getElementById("fechar").style.display = "block";
    //showhelp.style.display = "block";
    //showhelp1.style.display = "block";
    const productName = document.getElementById('productName').textContent;
   
    
    document.getElementById("pay-btn").innerHTML = "Proceder Pagamento";
  }

























