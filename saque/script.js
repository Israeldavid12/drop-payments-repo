// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
const db = getDatabase(app);

// Função para obter parâmetros da URL
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    userId: params.get("userId"),
    paymentId: params.get("paymentId"),
    amountPaid: params.get('amountPaid'),
    emailSeller: params.get('emailSeller'),
    paymentMethod: params.get('paymentMethod'),
  };
}

// Atualizar status no Firebase
async function updateStatus() {
  const { userId, paymentId } = getURLParams();

  // Validar parâmetros
  if (!userId || !paymentId) {
    document.getElementById('statusMessage').style.color = 'red';
    document.getElementById("statusMessage").innerText = "Parâmetros inválidos na URL.";
    return;
  }

  const paymentRef = ref(db, `users/${userId}/withdrawHistory/${paymentId}`);
  
  try {
    await update(paymentRef, { status: "concluido" });
    document.getElementById("statusMessage").innerText = "Status atualizado com sucesso para 'concluído'.";
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    document.getElementById('statusMessage').style.color = 'red';
    document.getElementById("statusMessage").innerText = "Erro ao atualizar status. Verifique os logs.";
  }
}


const { paymentId,  amountPaid, emailSeller, paymentMethod  } = getURLParams();
const payloadEmail = {
  paymentId: paymentId,
  amountPaid: amountPaid,
  emailSeller: emailSeller,
  paymentMethod: paymentMethod,
  templateType: '9-C-S',
  timestamp: new Date().toISOString(),
}

fetch('https://www.dropaymentsmz.online/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json' 
  }, 
  body:JSON.stringify(payloadEmail)
}).then(response => response.json())
.then(data => {
  document.getElementById('statusEmail').textContent = data.message;
});

// Chamar a função quando a página carregar
window.onload = updateStatus;
