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
let productPrice = 0; // Definindo a variável productPrice

// Fetch the product data from Firestore
async function fetchProductData(productId) {
    const productRef = doc(db, 'upsells', productId);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
        const productData = docSnap.data();
        productPrice = parseFloat(productData.price).toFixed(2); // Armazenando o preço do produto
        document.getElementById('productPrice').textContent = `${productPrice} US$`;
        document.getElementById('productName').textContent = productData.name;
        document.getElementById('image-url').src = productData.imageUrl;

        document.getElementById("priceValue").textContent =  `${productPrice} US$`;
        document.getElementById("nameValue").textContent = productData.name;

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

// Initialize PayPal Buttons
paypal.Buttons({
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: productPrice // Usando productPrice
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            console.log('Payment Successful!');
            const paymentEmail = document.getElementById('email').value;
            const paymentName = document.getElementById('nome').value;
            const paymentWhatsapp = document.getElementById('whatsapp').value;
            savePaymentToFirebase(productId, productPrice, paymentEmail, productUserId, 'PayPal', paymentName, paymentWhatsapp);
        });
    },
    onError: function(err) {
        console.error('Payment Error:', err);
    }
}).render('#paypal-button-container');

// Function to save payment details in Firebase Realtime Database
function savePaymentToFirebase(productId, originalPrice, paymentEmail, userId, paymentMethod, paymentName, paymentWhatsapp) {
    const paidAmount = (originalPrice * 0.94).toFixed(2); // Deduct 6%
    const paymentId = new Date().getTime().toString(); // Unique payment ID using timestamp
    const exchangeRate = 63; // Taxa de câmbio fixa

    const meticalValue = (originalPrice * exchangeRate).toFixed(2); // Conversão para Metical

    const paymentData = {
        productId,
        originalAmount: originalPrice,
        paidAmount,
        meticalAmount: meticalValue, // Nova chave com o valor convertido
        paymentEmail,
        paymentName,
        paymentWhatsapp,
        paymentMethod,
        timestamp: new Date().toISOString()
    };

    const paymentRef = ref(rtdb, `users/${userId}/payments/${paymentId}`);
    const paymentBackupRef = ref(rtdb, `users/${userId}/paymentsBackup/${paymentId}`);

    // Save payment details to Firebase
    set(paymentRef, paymentData).then(() => {
        console.log('Payment saved successfully in Firebase!');
        const docUrl = window.docUrl;
        if (docUrl) {
            const encodedDocUrl = encodeURIComponent(docUrl);
            window.location.href = `download-upsell.html?id=${encodedDocUrl}`;
        } else {
            console.error('docUrl is undefined, cannot redirect.');
        }
    }).catch(error => {
        console.error('Error saving payment in Firebase:', error);
    });

    // Backup payment details
    set(paymentBackupRef, paymentData).then(() => {
        console.log('Payment backup saved successfully in Firebase!');
    }).catch(error => {
        console.error('Error saving payment backup in Firebase:', error);
    });
}

