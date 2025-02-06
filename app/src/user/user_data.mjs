import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { formatBalance } from "../pages/finances-hub.js";
import { setAnOutPut } from "../animations/index.js";

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
  metodo: '1',
  name: '',
  email: '',
  balance: '',
  paypalBalance: '',
  withdrawArray: [],
};
let userDataP = {};


// Função para pegar o UID de forma assíncrona
export const getUserId = () => {
  const auth = getAuth();

  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem('userI', user.uid);
        sessionStorage.setItem('userId', user.uid);
        resolve(user.uid); // Retorna o UID se o usuário estiver logado
      } else {
        reject("Nenhum usuário logado"); // Se não houver usuário logado, rejeita
        window.location.href = 'http://127.0.0.1:5501/entrar.html';
      }
    });
  });
};

const get_data = async () => {
  const userid = await getUserId();
  const fech_data = await axios.post('https://www.dropaymentsmz.online/api/balance', {
    userId: userid,
    reqType: 'user_data',
  });
  const firstLetter = fech_data.data.user_name.charAt(0).toUpperCase();
  document.getElementById('open_user_menu').textContent = firstLetter;

}


get_data();



export async function userData() {

  try {
    const userId = await getUserId();
    const fech_data = await axios.post('https://www.dropaymentsmz.online/api/balance', {
      userId: userId,
      reqType: 'user_data',
    });
    const data = fech_data.data;

    localStorage.setItem('name', data.user_name);
    localStorage.setItem('email', data.user_email);
    // console.log(data.user_name);
    return {
      name: data.user_name,
      email: data.user_email,
      balance: data.balance,
      paypalBalance: data.paypalBalance,
      vendasHoje: data.vendasHoje,
    };
  } catch (error) {
    console.log(error);
  }

}

userData();


export async function logOut() {
  const auth = getAuth(); // Obtém a instância de autenticação

  signOut(auth)
    .then(() => {
      console.log("Logout realizado com sucesso!");
      window.location.href = 'http://127.0.0.1:5501/entrar.html'
      // Aqui você pode redirecionar o usuário ou atualizar a interface
    })
    .catch((error) => {
      console.error("Erro ao fazer logout:", error);
      setAnOutPut(error, 'E-M')
    });
}





// Função principal para processar o usuário autenticado
// async function processUser() {

//   onAuthStateChanged(auth, async (user) => {
//     if (user) {
//       userState.userid = user.uid; // Pega o ID do usuário logado
//        id_user = await user.id;
//       a

//       try {
//         // Histórico de saques
//         const withdrawHistoryRef = ref(db, `users/${userState.userid}/withdrawHistory`);
//         const withdrawSnapshot = await get(withdrawHistoryRef);

//         if (withdrawSnapshot.exists()) {
//           const withdrawHistory = withdrawSnapshot.val();
//           userState.withdrawArray = Object.entries(withdrawHistory)
//             .map(([key, value]) => ({ id: key, ...value }))
//             .reverse();

//           console.log("Histórico de saques:", userState.withdrawArray);
//         } else {
//           console.error("Nenhum histórico encontrado.");
//         }

//         // Requisição para obter dados de pagamento do usuário
//         const paymentResponse = await axios.post('https://www.dropaymentsmz.online/api/balance', {
//           userId: userState.userid,
//           reqType: 'user_payment_data',
//         });

//         console.log("Dados de pagamento:", paymentResponse.data);

//         userState.metodo = paymentResponse.data.data.metodo;

//         // Requisição para obter dados gerais do usuário
//         const userDataResponse = await axios.post('https://www.dropaymentsmz.online/api/balance', {
//           userId: userState.userid,
//           reqType: 'user_data',
//         });

//         const { user_name, user_email, balance, paypalBalance } = userDataResponse.data;

//         // Atualizando o estado do usuário
//         userState.name = user_name;
//         userState.email = user_email;
//         userState.balance = balance;
//         userState.paypalBalance = paypalBalance;

//         // Atualizar interface do usuário
//         const firstLetter = userState.name.charAt(0).toUpperCase();
//         document.getElementById('open_user_menu').textContent = firstLetter;

//         console.log({
//           name: userState.name,
//           email: userState.email,
//           balance: userState.balance,
//           paypalBalance: userState.paypalBalance,
//         });

//       } catch (error) {
//         console.error("Erro ao processar dados do usuário:", error);
//       }
//     } else {
//       // Redirecionar para a página de login
//       window.location.href = 'https://www.dropaymentsmz.online/entrar';
//     }
//   });
// }





export const withdrawHistory = async () => {

  try {
    const userId = await getUserId();
   /// console.log(userId);
    const withdrawHistoryRef = ref(db, `users/${userId}/withdrawHistory`);
    const withdrawSnapshot = await get(withdrawHistoryRef);

    if (withdrawSnapshot.exists()) {

      const withdrawHistory = withdrawSnapshot.val();
      userState.withdrawArray = Object.entries(withdrawHistory)
        .map(([key, value]) => ({ id: key, ...value }))
        .reverse();

      // console.log("Histórico de saques:", userState.withdrawArray);
    } else {
      console.error("Nenhum histórico encontrado.");
    }

    return userState.withdrawArray;


  } catch (error) {
    return 'OCORREU UM ERRO  INESPERADO'
  }
};

// // Inicializa o processamento do usuário

// document.addEventListener("DOMContentLoaded", () => {
//   processUser();

// });