import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { formatBalance } from "../pages/finances-hub.js";

// Configuração do Firebase
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

// Inicializando Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);

// Estado do usuário
const userState = {
  userid: '',
  name: '',
  email: '',
  balance: '',
  paypalBalance: '',
  withdrawArray: [],
};

// Função principal para processar o usuário autenticado
async function processUser() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userState.userid = user.uid; // Pega o ID do usuário logado

      try {
        // Histórico de saques
        const withdrawHistoryRef = ref(db, `users/${userState.userid}/withdrawHistory`);
        const withdrawSnapshot = await get(withdrawHistoryRef);

        if (withdrawSnapshot.exists()) {
          const withdrawHistory = withdrawSnapshot.val();
          userState.withdrawArray = Object.entries(withdrawHistory)
            .map(([key, value]) => ({ id: key, ...value }))
            .reverse();

          console.log("Histórico de saques:", userState.withdrawArray);
        } else {
          console.error("Nenhum histórico encontrado.");
        }

        // Requisição para obter dados de pagamento do usuário
        const paymentResponse = await axios.post('https://www.dropaymentsmz.online/api/balance', {
          userId: userState.userid,
          reqType: 'user_payment_data',
        });

        console.log("Dados de pagamento:", paymentResponse.data);

        // Requisição para obter dados gerais do usuário
        const userDataResponse = await axios.post('https://www.dropaymentsmz.online/api/balance', {
          userId: userState.userid,
          reqType: 'user_data',
        });

        const { user_name, user_email, balance, paypalBalance } = userDataResponse.data;

        // Atualizando o estado do usuário
        userState.name = user_name;
        userState.email = user_email;
        userState.balance = balance;
        userState.paypalBalance = paypalBalance;

        // Atualizar interface do usuário
        const firstLetter = userState.name.charAt(0).toUpperCase();
        document.getElementById('open_user_menu').textContent = firstLetter;

        console.log({
          name: userState.name,
          email: userState.email,
          balance: userState.balance,
          paypalBalance: userState.paypalBalance,
        });

      } catch (error) {
        console.error("Erro ao processar dados do usuário:", error);
      }
    } else {
      // Redirecionar para a página de login
      window.location.href = 'https://www.dropaymentsmz.online/entrar';
    }
  });
}

// Funções auxiliares para acessar os dados do usuário
export const userPaymentData = () => {
  return {
    userId: userState.userid,
    balance: userState.balance,
    paypalBalance: userState.paypalBalance,
  };
};

export const userData = () => {
  return {
    name: userState.name,
    email: userState.email,
    balance: userState.balance,
    paypalBalance: userState.paypalBalance,
  };
};

export const withdrawHistory = () => {
  return userState.withdrawArray;
};

// Inicializa o processamento do usuário
processUser();
