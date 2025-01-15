// Import Firebase and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Firebase configuration
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
    document.getElementById('productPrice').textContent = `${productData.price}.00 MT`;
    document.getElementById('productName').textContent = productData.name;
    document.getElementById('image-url').src = productData.imageUrl;

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








// Function to handle form submission and prevent default behavior
document.getElementById('pay-btn').addEventListener('click', function(event) {
  event.preventDefault();  // Impede o envio do formulário da forma tradicional
  
  document.getElementById("infoError").innerText = "Insira o PIN e aguarde...";

  document.getElementById("fechar").style.display = "none";


  const nameContainer = document.getElementById('divnome');
  const emailContainer = document.getElementById('divemail');
  const inputOutputName = document.getElementById('inputoutputNome');
  const inputOutputEmail = document.getElementById('inputoutputEmail');

    // Verifica se o campo "Nome" está visível (display: block) e vazio
    if (window.getComputedStyle(nameContainer).display === 'block' && !document.getElementById('nome').value) {
      inputOutputName.style.display = "block";
      inputOutputName.textContent = "O campo Nome é obrigatório.";
      const position = nameContainer.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: position, behavior: 'smooth' }); // Rolagem suave até a posição do elemento
      return; // Interrompe a execução
  }

  // Verifica se o campo "Email" está visível (display: block) e vazio
  if (window.getComputedStyle(emailContainer).display === 'block' && !document.getElementById('email').value) {
      inputOutputEmail.style.display = "block";
      inputOutputEmail.textContent = "O campo Email é obrigatório.";
      const position = emailContainer.getBoundingClientRect().top + window.pageYOffset;
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
    return;
  }

  // Verifica se o número de pagamento possui exatamente 9 caracteres
  if (paymentNumber.length !== 9) {
    inputOutput.textContent = ' campo do número de pagamento está vazio.';
    inputOutput.style.display = 'block';
    console.error('O número de pagamento deve ter exatamente 9 dígitos.');
    payBtn.textContent = "Proceder Pagamento";  // Volta o texto do botão para o original
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
    paymentMethod = "mpesa";

    // Verifica se o número começa com 84 ou 85
    if (!(paymentNumber.startsWith('84') || paymentNumber.startsWith('85'))) {
      inputOutput.textContent = 'O número de M-pesa deve começar com 84 ou 85.';
      inputOutput.style.display = 'block';
      console.error('O número de M-pesa deve começar com 84 ou 85.');
      payBtn.textContent = "Proceder Pagamento";  // Volta o texto do botão para o original
      return;
    }

    displayPaymentPopup('checkou-assets/mpesa-red.png', 'red');

  } else { // E-Mola
    ENDPOINT = "https://e2payments.explicador.co.mz/v1/c2b/emola-payment/992039";
    paymentMethodDb = 'E-Mola';
    paymentMethod = "emola";
    

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
          

          // Redireciona após a confirmação do pagamento
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
          console.error('Erro na requisição:', error.request);
      } else {
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
function handlePaymentError(error, productId) {
  document.getElementById("infoError").innerText = "ERRO AO CONCLUIR O PAGAMENTO! \n POR FAVOR TENTE NOVAMENTE";
  console.error("Payment Failed:", error);
  
  document.getElementById("fechar").style.display = "block";
  const productName = document.getElementById('productName').textContent;

  showhelp1.addEventListener('click', () => {
    window.location.href = `https://api.whatsapp.com/send?phone=258863814050&text=Preciso%20de%20ajuda%20para%20concluir%20o%20pagamento%20do%20produto:%20${productName}%0AID%20do%20produto:${productId}`;
  });
  document.getElementById("pay-btn").innerHTML = "Proceder Pagamento";
}

// Function to save payment details in Firebase Realtime Database
function savePaymentToFirebase(productId, originalPrice, paymentNumber, userId, paymentMethod, paymentName, paymentEmail, paymentWhatsapp) {
  const paidAmount = (originalPrice * 0.94).toFixed(2); // Deduct 6%
  const name = document.getElementById('productName').textContent;

  // Generate a unique payment ID using timestamp
  const paymentId = new Date().getTime().toString();

  const paymentRef = ref(rtdb, `users/${userId}/payments/${paymentId}`);
  const paymentRef2 = ref(rtdb, `users/${userId}/paymentsBackup/${paymentId}`);
  const paymentRef3 = ref(rtdb, `usersPaymentsBackup/${paymentId}`);

  const paymentData = {
    productId: productId,
    originalAmount: originalPrice,
    paidAmount: paidAmount,
    paymentNumber: paymentNumber,
    paymentName: paymentName,
    paymentEmail: paymentEmail,
    paymentWhatsapp: paymentWhatsapp,
    paymentMethod: paymentMethod,
    nome: name,
    timestamp: new Date().toISOString()
  };


  const params = new URLSearchParams();
  const emailPayer = document.getElementById("email").value;
  const namePayer = document.getElementById("nome").value;
  const nameProduct = document.getElementById("productName").textContent;
  params.append('emailPayer', emailPayer);
  params.append('namePayer', namePayer);
  params.append('nameProduct', nameProduct);

  // Save payment to Firebase
  Promise.all([
    set(paymentRef, paymentData),
    set(paymentRef2, paymentData),
    set(paymentRef3, paymentData)
  ])
  .then(() => {
    console.log('Payment saved successfully in Firebase!');
    // Redirect to download.html with the docUrl as a query parameter
    const docUrl = window.docUrl;
    if (docUrl) {
      const encodedDocUrl = encodeURIComponent(docUrl);
      params.append('id', encodedDocUrl);
      window.location.href = `checked_page_01.html?` + params.toString();
    } else {
      console.error('docUrl is undefined, cannot redirect.');
    }
  })
  .catch((error) => {
    console.error('Error saving payment in Firebase:', error);
  });
}
