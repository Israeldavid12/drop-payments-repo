import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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

let userid = '';
let name = '';
let email = '';
onAuthStateChanged(auth, (user) => {
  if (user) {
    userid = user.uid; // Pega o ID do usuário logado
    axios.post('https://www.dropaymentsmz.online/api/balance', {
      userId: userid,
    })
    .then(function (response) {
      name = response.data.user_name;
      email = response.data.user_email;
      const pic_letter = response.data.user_name;
      const first_letter = pic_letter.charAt(0).toUpperCase();
      const hub =  document.querySelector('.finances-hub');
      document.getElementById('open_user_menu').textContent = first_letter;
           
    }) 
    .catch(function (error) {
      console.log(error);
    });
   
  } else {
      // Redirecionar para a página de login
      window.location.href = 'https://www.dropaymentsmz.online/entrar';
  }
});

export default function userData() {

  return {
    name: name,
    email: email
  };
  
}

