// Import Firebase and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyDfNNPtqhpG7ShUJo8n89ONoKOq45Xy91w",
  authDomain: "drop-payments-mz.firebaseapp.com",
  databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "drop-payments-mz",
  storageBucket: "drop-payments-mz.appspot.com",
  messagingSenderId: "983262508468",
  appId: "1:983262508468:web:c0a6e26cf8789807b26ee1",
  measurementId: "G-JBP3RN50WS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);





// Get the product ID from the URL query string
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const productId = urlParams.get('id');

// Variable to store userId from product data
let productUserId = '';

// Fetch the product data from Firestore
async function fetchProductData(productId) {
  const productRef = doc(db, 'products', productId);
  const docSnap = await getDoc(productRef);

  if (docSnap.exists()) {
    const productData = docSnap.data();
    document.getElementById('baner-url').src = productData.bannerUrl;
    document.getElementById('productPrice').textContent = `${productData.price}.00 MT`;
    document.getElementById('productName').textContent = productData.name;
    document.getElementById('image-url').src = productData.imageUrl;
    
    
    


// Função para buscar várias chaves
function pegarValoresDeMultiplasChaves(userId) {
  // Referência para a raiz ou parte do caminho no Realtime Database
  const configRef = ref(rtdb, `users/${userId}/checkoutUserConfig`);

  // Usar o método `get` para buscar os valores de várias chaves
  get(configRef).then((snapshot) => {
    if (snapshot.exists()) {
      // Obter os valores das chaves individuais
      const data = snapshot.val();

      // Se as chaves existirem, atribuí-las a constantes
      const checkoutColor = data.checkoutColor;
      const switchMpesa = data.mpesa;
      const switchEmola = data.emola;
      const autoSales = data.autoSales;
      const checkouttextColor = data.checkouttextColor;


      const switchEmail = data.emailBuyer;
      const switchPrice = data.manualPrice;
      const switchName = data.nameBuyer;
      const switchWhatsapp = data.whatsappBuyer;
      const switchMozicon = data.mozIcon;
      const switchBanner = data.bannerCheckbox;
      const switchsupport = data.supportCheckbox;
      const supportEmail = data.supportLink;

      //document.getElementById('supportEmail').addEventListener('click', function() {
       // window.location.href = `${supportEmail}`;
  //  });
      
      
     
       // Verifica se o valor de autoSales é igual a true

       const hiddenAutosales = document.getElementById('purchase-notification');
       //Ocultando campo de nome do usuario
       const hiddenName = document.getElementById('divnome');
       const hiddenLabelName = document.getElementById('labelNome');
      
       //Ocultandp o campo de email
       const hiddenEmail = document.getElementById('divemail');
       const hiddenLabelEmail = document.getElementById('labelEmail');

       //Ocultandp o campo de whatsapp
       const hiddenwhatsapp = document.getElementById('divwhatsapp');
       const hiddenLabelWhatsapp = document.getElementById('labelWhatsapp');
      


      const manualPrice = document.getElementById('priceInserted');
      const manualPriceLabel = document.getElementById('divpriceInserted');
      const manualLabel = document.getElementById('labeInserted');
      const textPrice = document.getElementById('productPrice');

      //Ocultando icone de bandeira
      const mozicon = document.getElementById('mozIcon');
      //Ocultando o banner
      const banner = document.getElementById('baner-url');
      
      //Ocultando botao de suporte
      const supporte = document.getElementById('supportLink');
     // const help = document.getElementById('help');
     

       if (autoSales === true) {
        hiddenAutosales.style.display = 'block';  // Exibe o elemento
      } 
      else {
        hiddenAutosales.style.display = 'none';  // Oculta o elemento
      }

      if (switchName === true) {
        hiddenName.style.display = 'flex'; 
        hiddenLabelName.style.display = 'block';
      } 
      else {
        hiddenName.style.display = 'none'; 
        hiddenLabelName.style.display = 'none';
      }


      if (switchEmail === true) {
        hiddenEmail.style.display = 'flex'; 
        hiddenLabelEmail.style.display = 'block';
      } 
      else {
        hiddenEmail.style.display = 'none'; 
        hiddenLabelEmail.style.display = 'none';
      }


      if (switchWhatsapp === true) {
        hiddenwhatsapp.style.display = 'flex'; 
        hiddenLabelWhatsapp.style.display = 'block';
      } 
      else {
        hiddenwhatsapp.style.display = 'none'; 
        hiddenLabelWhatsapp.style.display = 'none';
      }


      if (switchPrice === true) {
        manualPriceLabel.style.display = 'flex'; 
        manualPrice.style.display = 'block';
        manualLabel.style.display = 'block';
        textPrice.style.display = "none";
      } 
      else {
        manualPriceLabel.style.display = 'none'; 
        manualPrice.style.display = 'none';
        manualLabel.style.display = 'none';
      }
        

      if (switchBanner === true) {
        banner.style.display = "block"
      } 
      else {
        banner.style.display = "none"
      }

      


    
      // Supondo que você tenha algo para atualizar com base nos switches:
     // const mpesaSwitchElement = document.getElementById('mpesaSwitch');
      //mpesaSwitchElement.checked = switchMpesa;

     // const emolaSwitchElement = document.getElementById('emolaSwitch');
     // emolaSwitchElement.checked = switchEmola;
    } else {
      console.log("As chaves não existem.");
    }
  }).catch((error) => {
    console.error("Erro ao buscar os valores das chaves:", error);
  });
}







// Chame a função passando o ID do usuário (você deve ter isso no seu sistema)
    const userId = productData.userId;
    pegarValoresDeMultiplasChaves(userId);




    // Extract userId and docUrl from the product data
    productUserId = productData.userId;
    const docUrl = productId;
    console.log(docUrl);

    if (docUrl) {
      // Decode the docUrl
      const decodedDocUrl = docUrl;
      // Store the decoded docUrl in a global variable or pass it where needed
      window.docUrl = decodedDocUrl;
      console.log(decodedDocUrl);
    } else {
      console.error('docUrl is not defined in the Firestore document.');
    }
  } else {
    console.error('No such document!');
    document.getElementById('hide-checkout').classList.remove('d-none');
    document.getElementById('hide-checkout').classList.add('d-grid');
  }
}

// Call the function to fetch product data
if (productId) {
  fetchProductData(productId);
} else {
  console.error('Product ID is missing in the URL.');
  document.getElementById('hide-checkout').classList.remove('d-none');
  document.getElementById('hide-checkout').classList.add('d-grid');
}







let manualPriceActive = '';



function pegarValores(productId) {
  const productRef = doc(db, 'products', productId);
  
  getDoc(productRef).then((docSnap) => {
    if (docSnap.exists()) {
      const productData = docSnap.data();
      const userId = productData.userId;
      const configRef = ref(rtdb, `users/${userId}/checkoutUserConfig`);

      // Obter os valores de configuração do banco de dados
      get(configRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
           manualPriceActive = data.manualPrice; // true
           
         
        } else {
          console.log("Configurações não encontradas.");
        }
      }).catch((error) => {
        console.error("Erro ao buscar configurações:", error);
      });
      
    } else {
      console.error('Produto não encontrado.');
      
    }
  }).catch((error) => {s
    console.error("Erro ao buscar produto:", error);
  });
}

pegarValores(productId);

function manualPrice() {
  const manualPriceInserted = parseFloat(document.getElementById('priceInserted').value); // 999
  const productPriceValue = document.getElementById('productPrice');

  // Atualiza o valor do preço se a configuração estiver ativa
  if (manualPriceActive === true) {
    productPriceValue.textContent = manualPriceInserted;
  } else {
    console.log("");
  }
}







// Function to handle form submission and prevent default behavior

document.getElementById('pay-btn').addEventListener('click',  function(event) {
  event.preventDefault();  // Impede o envio do formulário da forma tradicional
  manualPrice();

  document.getElementById("infoError").innerText = "Insira o PIN e aguarde...";

  document.getElementById("fechar").style.display = "none";

  const nameContainer = document.getElementById('divnome');
  const emailContainer = document.getElementById('divemail');
  const priceContainer = document.getElementById('divpriceInserted');
  const inputOutputName = document.getElementById('inputoutputNome');
  const inputOutputEmail = document.getElementById('inputoutputEmail');
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
  let ENDPOINT = "";
  let paymentMethod = "";
  let paymentMethodDb = "";

  const buttonColor = window.getComputedStyle(payBtn).backgroundColor;

  // Verifica se o método de pagamento é M-pesa ou E-mola
  if (buttonColor === 'rgb(255, 0, 0)' || buttonColor === 'rgb(183, 28, 28)') { // M-pesa
    ENDPOINT = "https://e2payments.explicador.co.mz/v1/c2b/mpesa-payment/992038";
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

    displayPaymentPopup('checkou-assets/mpesa-red.png', 'red');

  } else { // E-Mola
    ENDPOINT = "https://e2payments.explicador.co.mz/v1/c2b/emola-payment/992039";
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

    displayPaymentPopup('assests/emola.png', '#FA742C');
  }
 


 
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


  





const name = document.getElementById('productName').textContent;



// Prepare os dados para enviar ao backend
const payload = {
  paymentMethodDb:  paymentMethodDb,
  paymentMethod: paymentMethod,
  amount: price, // A variável originalPrice deve estar definida anteriormente
  phone: paymentNumber,
  reference: cleanProductName, // Coloque aqui a referência do pagamento
  userId: productUserId, // Coloque aqui o ID do usuário
  productId: productId, // Coloque aqui o ID do produto
  paymentName: paymentName,
  paymentEmail: paymentEmail,
  paymentWhatsapp: paymentWhatsapp,
  originalAmount: price,
  nome: name,
};



axios.post('https://www.dropaymentsmz.online/api/pay', payload, {
  headers: {
      'Content-Type': 'application/json'
  }
})
  .then(response => {
      // Atribui a resposta do JSON à variável res
      const res = response.data;
     

      // Verifica se a chave estado é 'feito'
      if (res.estado === 'feito') {

        const docUrl = window.docUrl;
        if (docUrl) {
            const encodedDocUrl = encodeURIComponent(docUrl);
            const params = new URLSearchParams();
            params.append('id', encodedDocUrl);
            const emailPayer = document.getElementById("email").value;
            const namePayer = document.getElementById("nome").value;
            const nameProduct = document.getElementById("productName").textContent;
            params.append('emailPayer', emailPayer);
            params.append('namePayer', namePayer);
            params.append('nameProduct', nameProduct);

            window.location.href = `checked_page_01.html?` + params.toString();
        } else {
            console.error('docUrl is undefined, cannot redirect.');
        }
    
          
      } else {
          // Lida com o erro de pagamento
          handlePaymentError(res.error, productId);
          console.log('handlePaymentUsing() end with errors #108...');
          console.error('Erro ao processar o pagamento:', res.error);
      }
  })
  .catch(error => {
      // Lida com erros de requisição
      if (error.response) {
          // Resposta da API com erro
          console.error(`Erro ${error.response.status}: ${error.response.data.message}`);
          handlePaymentError(error.response.data, productId);
      } else if (error.request) {
          // Sem resposta do servidor
          handlePaymentError(res.error, productId);
          console.error('Erro na requisição:', error.request);
      } else {
        handlePaymentError(res.error, productId);
          // Erro ao configurar a requisição
          console.error('Erro:', error.message);
      }

      console.log('handlePaymentUsing() end with errors #108...');
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
function handlePaymentError(errorMessage, productId) {
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

