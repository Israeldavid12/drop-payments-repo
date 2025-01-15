 // Import Firebase SDKs
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
 import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
 import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

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
 const firestore = getFirestore(app);
 const rtdb = getDatabase(app);

 // Get DOM element where the pixel code will be displayed
 const pixelDiv = document.getElementById('pixel');

 // Function to get the product ID from the URL
 function getProductIdFromUrl() {
     const params = new URLSearchParams(window.location.search);
     return params.get('id'); // Return the 'id' from URL parameters
 }

 // Function to get userId from Firestore using the productId
 async function getUserIdFromFirestore(productId) {
     const productDocRef = doc(firestore, `products/${productId}`);
     const productDoc = await getDoc(productDocRef);
     
     if (productDoc.exists()) {
         return productDoc.data().userId; // Return the userId from the Firestore document
     } else {
         throw new Error('Produto não encontrado.');
     }
 }

 // Function to get pixel code from Realtime Database using userId
 async function getPixelCodeFromDatabase(userId) {
     const pixelRef = ref(rtdb, `users/${userId}/pixelCode/pixel`);
     const snapshot = await get(pixelRef);

     if (snapshot.exists()) {
         return snapshot.val(); // Return the pixel code from Realtime Database
     } else {
         throw new Error('Nenhum código de pixel encontrado.');
     }
 }

 // Function to inject the pixel code dynamically as a script tag
function injectPixelCode(pixelCode) {
    // Separate the script portion and the noscript portion (if applicable)
    const parser = new DOMParser();
    const doc = parser.parseFromString(pixelCode, 'text/html');

    // Extract the <script> and <noscript> tags from the parsed code
    const scripts = doc.querySelectorAll('script');
    const noscripts = doc.querySelectorAll('noscript');

    // Append all <script> tags to the body
    scripts.forEach(scriptTag => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.textContent = scriptTag.textContent;
        document.body.appendChild(script);
    });

    // Append all <noscript> tags to the body
    noscripts.forEach(noscriptTag => {
        const noscript = document.createElement('noscript');
        noscript.innerHTML = noscriptTag.innerHTML;
        document.body.appendChild(noscript);
    });
}

// Main function to execute the logic
async function loadPixelCode() {
    try {
        // Get productId from URL
        const productId = getProductIdFromUrl();
        if (!productId) {
            console.error("ID do produto não fornecido.");
            return;
        }

        // Get userId from Firestore
        const userId = await getUserIdFromFirestore(productId);
        
        // Get pixel code from Realtime Database
        const pixelCode = await getPixelCodeFromDatabase(userId);
        
        // Inject the pixel code as a real script and noscript
        injectPixelCode(pixelCode);

    } catch (error) {
        // Log error in the console
        console.error("Erro:", error.message);
    }
}

// Ensure the function runs after the page is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    loadPixelCode();
});