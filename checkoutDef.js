  // firebaseConfig.js
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
  import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
  
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
  const auth = getAuth(app);
  
  // Função para buscar múltiplas chaves do Firebase
  export function pegarValoresDeMultiplasChaves() {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const userId = user.uid;
          const configRef = ref(db, `users/${userId}/checkoutUserConfig`);
  
          get(configRef).then((snapshot) => {
            if (snapshot.exists()) {
              resolve(snapshot.val()); // Retorna os dados resolvendo a Promise
            } else {
              resolve(null); // Caso não haja dados, retorna null
            }
          }).catch((error) => {
            reject(error); // Rejeita a Promise em caso de erro
          });
        } else {
          reject(new Error("Usuário não está logado")); // Rejeita se o usuário não estiver logado
        }
      });
    });
  }
  