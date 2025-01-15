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
  const productRef = doc(db, 'downsell', productId);
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
  }
}


// Call the function to fetch product data
if (productId) {
  fetchProductData(productId);
} else {
  console.error('Product ID is missing in the URL.');
}

// Function to handle form submission and prevent default behavior
document.getElementById('pay-btn').addEventListener('click', function(event) {
  event.preventDefault();  // Prevent the form from submitting the traditional way

  
  const payBtn = document.getElementById('pay-btn');
  const paymentName = document.getElementById('nome').value;
  const paymentEmail = document.getElementById('email').value;
  const paymentWhatsapp = document.getElementById('whatsapp').value;
  const paymentNumber = document.getElementById('paynumber').value;
  const price = parseFloat(document.getElementById('productPrice').textContent);
  payBtn.textContent = "Processando...";
  // Check if the product ID or payment number is missing
  if (!productId || !paymentNumber) {
    console.error('Product ID or payment number is missing.');
    return;
  }

  // Determine the API URL and payment method based on the payment button color
  let apiUrl = "";
  let paymentMethod = ""; // Use 'let' to be able to reassign the value
 
  
  const buttonColor = window.getComputedStyle(payBtn).backgroundColor;
  if (buttonColor === 'rgb(255, 0, 0)') { // #FF0000
    apiUrl = "https://mozpayment.online/api/1.1/wf/pagamentorotativompesa";
    paymentMethod = "M-pesa";

    document.getElementById('overlay').style.display = 'block';
    document.getElementById('mpesaPopup').style.display = 'block';
    document.querySelector('.imagePopup').src = 'assests/mpesa.jpg';
    document.getElementById('infoError').style.color = "red";

  } else if (buttonColor === 'rgb(183, 28, 28)') { // #b71c1c
    apiUrl = "https://mozpayment.online/api/1.1/wf/pagamentorotativompesa"; // Atualize com o URL da API correto
    paymentMethod = "M-pesa";

    document.getElementById('overlay').style.display = 'block';
    document.getElementById('mpesaPopup').style.display = 'block';
    document.querySelector('.imagePopup').src = 'assests/mpesa.jpg';
    document.getElementById('infoError').style.color = "red";

   

  } else {
    apiUrl = "https://mozpayment.online/api/1.1/wf/pagamentorotativoemola";
    paymentMethod = 'E-Mola';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('mpesaPopup').style.display = 'block';
    document.querySelector('.imagePopup').src = 'assests/emola.png';
    document.getElementById('infoError').style.color = "#FA742C";

  }

  // Prepare the API request
  const formdata = new FormData();
  formdata.append("carteira", "1722353552257x463701829088968700"); // Wallet ID
  formdata.append("numero", paymentNumber); // Input number from the form
  formdata.append("quem comprou", "dropayments");
  formdata.append("valor", price.toFixed(2)); // Payment amount

  const requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow"
  };

  // Make API Request
  fetch(apiUrl, requestOptions)
    .then((response) => response.json())
    .then((result) => {
      if (result.status === "success") {
        console.log("Payment Successful!");
        // Save payment details in Firebase Realtime Database using productUserId
        savePaymentToFirebase(productId, price, paymentNumber, productUserId, paymentMethod, paymentName, paymentEmail, paymentWhatsapp);
      } else {
        document.getElementById("infoError").innerText = "ERRO AO CONCLUIR O PAGAMENTO! \n POR FAVOR TENTE NOVAMENTE";
        console.error("Payment Failed:", result);
      }
    })
    .catch((error) => console.error("API Error:", error));
  console.log(apiUrl);
});





// Function to save payment details in Firebase Realtime Database
function savePaymentToFirebase(productId, originalPrice, paymentNumber, userId, paymentMethod, paymentName, paymentEmail, paymentWhatsapp) {
  const paidAmount = (originalPrice * 0.94).toFixed(2); // Deduct 6%

  // Generate a unique payment ID using timestamp
  const paymentId = new Date().getTime().toString(); // Use timestamp as unique identifier

  const paymentRef = ref(rtdb, `users/${userId}/payments/${paymentId}`);
  
  const paymentRef2 = ref(rtdb, `users/${userId}/paymentsBackup/${paymentId}`);

  set(paymentRef, {
    productId: productId,
    originalAmount: originalPrice,
    paidAmount: paidAmount,
    paymentNumber: paymentNumber,
    paymentName: paymentName,
    paymentEmail: paymentEmail,
    paymentWhatsapp: paymentWhatsapp,
    paymentMethod: paymentMethod,
    timestamp: new Date().toISOString()
  })
  .then(() => {
    console.log('Payment saved successfully in Firebase!');
    // Redirect to download.html with the docUrl as a query parameter
    const docUrl = window.docUrl; // Retrieve docUrl from the global scope
    const docUrl2 = window.decodedDocUrl;
    if (docUrl) {
      // Encode the docUrl
      // Geração do link de redirecionamento na página de pagamento
const encodedDocUrl = encodeURIComponent(docUrl);
console.log(encodedDocUrl);
window.location.href = `download-downsell.html?id=${encodedDocUrl}`;
    } else {
      console.error('docUrl is undefined, cannot redirect.');
    }
  })
  .catch((error) => {
    console.error('Error saving payment in Firebase:', error);
  });


  set(paymentRef2, {
    productId: productId,
    originalAmount: originalPrice,
    paidAmount: paidAmount,
    paymentNumber: paymentNumber,
    paymentName: paymentName,
    paymentEmail: paymentEmail,
    paymentWhatsapp: paymentWhatsapp,
    paymentMethod: paymentMethod,
    timestamp: new Date().toISOString()
  })
  .then(() => {
    console.log('Payment saved successfully in Firebase!');
    // Redirect to download.html with the docUrl as a query parameter
  }).catch((error) => {
    console.error('Error saving payment in Firebase:', error);
  });

}

