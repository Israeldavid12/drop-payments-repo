// Import Firebase and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

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
let productPrice = 0; // Definindo a variável productPrice
let nameProduct = '';
let idProduct = '';
idProduct = productId;


// Fetch the product data from Firestore
async function fetchProductData(productId) {
    const productRef = doc(db, 'products', productId);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
        const productData = docSnap.data();
        productPrice = parseFloat(productData.price).toFixed(2); // Armazenando o preço do produto
        document.getElementById('baner-url').src = productData.bannerUrl;
        document.getElementById('productPrice').textContent = `${productPrice} US$`;
        document.getElementById('productName').textContent = productData.name;
        document.getElementById('image-url').src = productData.imageUrl;
        nameProduct = productData.name;
        document.getElementById("priceValue").textContent =  `${productPrice} US$`;
        document.getElementById("nameValue").textContent = productData.name;




     

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











  

        // Extract userId from the product data
       
        productUserId = productData.userId;
        window.docUrl = productId;



        
    } else {
        console.error('No such document!');
    }
}

// Call the function to fetch product data
if (productId) {
    fetchProductData(productId);
} else {
    console.error('Product ID is missing in the URL.');
}

let bidUSD = '';
fetch('https://economia.awesomeapi.com.br/json/last/USD-MZN')
  .then(response => response.json())  // Converte a resposta para JSON
  .then(data => {
    const bid = data.USDMZN.bid;  // Obtém a cotação 'bid'
    bidUSD = bid;
  })
  .catch(error => {
    console.error('Erro na requisição:', error);  // Caso ocorra um erro
    bidUSD = '63.20';
  });




 

document.getElementById('paypal').addEventListener('click', function() {
    const spiner = document.getElementById("spiner");
    const paypal_icon = document.getElementById("paypal_icon");
    spiner.style.display = 'block';
    paypal_icon.style.display = 'none';
    const Email = document.getElementById("email").value;
    const name = document.getElementById("productName").textContent;
    const encodedString = encodeURIComponent(name);
    console.log(encodedString)
    

fetch('https://www.dropaymentsmz.online/api/paypal-back-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: productUserId,
    sucessPage: "https://www.dropaymentsmz.online/checked_page_01.html",
    cancelPage: "https://www.dropaymentsmz.online/404.html",
    amount: productPrice,
    bidUSD: bidUSD,
    productId: idProduct,
    nameProduct: encodedString
  }),
})
  .then((response) => {
    console.log('Status da resposta:', response.status);
    return response.json();
  })
  .then((data) => {
    console.log('Resposta do backend:', data);
    if (data.approvalUrl) {
      window.location.href = data.approvalUrl;
    } else {
      console.error('approvalUrl ausente:', data);
    }
  })
  .catch((error) => console.error('Erro na requisição:', error));




});

