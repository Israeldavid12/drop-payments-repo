import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue, push, remove } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
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
const db = getDatabase(app);
const auth = getAuth();






onAuthStateChanged(auth, (user) => {
    if (user) {
      const labelClientId = document.getElementById("clientID");
      const userId2 = user.uid; // Pega o ID do usuário logado
      labelClientId.textContent = userId2;

      
        // User is signed in, get the user's ID
        const userId3 = user.uid;
            
        // Reference to the 'status' field in 'shopifyPlan'
        const statusRef = ref(db, `users/${userId3}/shopifyPLan/status`);
        
        // Retrieve the value
        get(statusRef).then((snapshot) => {
            if (snapshot.exists()) {
                const status = snapshot.val();
                // Set the status in the <p> tag
                const requestStatus = document.getElementById("requestStatus");
                const requestStatusRef = document.getElementById("statusRef");
                if (status === 'pending') {
                  requestStatus.style.display = 'block';
                  requestStatusRef.textContent = "PENDENTE";
                } 
                
                if (status === "aproved") {
                  requestStatus.style.display = 'block';
                  requestStatusRef.style.color = 'green';
                  requestStatusRef.textContent = 'APROVADO';
                } 
             
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
        
    } else {
        console.log("Usuário não está logado");
        // Redirecionar para a página de login
        window.location.href = 'https://www.dropaymentsmz.online/entrar';
    }
});













let totalVendas = 0; // Mantém o total fora da função para não ser redefinido
async function atualizarDados() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userId = user.uid;

      try {
        // Fazendo a requisição ao endpoint
        const response = await fetch("https://www.dropaymentsmz.online/api/balance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error("Erro when requesting");
        }

        const data = await response.json();

        // Formatando os valores no formato de moeda MZN
        const formatter = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "MZN",
        });

        const saldoFormatado = formatter.format(data.balance || 0);
        const vendasHojeFormatado = formatter.format(data.vendasHoje || 0);
        const paypalBalanceFormatado = formatter.format(data.paypalBalance || 0);

        // Atualizando os valores nos elementos HTML
        document.getElementById("saldoDisponivel").textContent = saldoFormatado;
        document.getElementById("vendasHoje").textContent = vendasHojeFormatado;
        document.getElementById("paypalBalance").textContent = paypalBalanceFormatado;
        document.getElementById("balancePreview").textContent = saldoFormatado;
        document.getElementById("balancePreviewPayPal").textContent = paypalBalanceFormatado;

      } catch (error) {
        console.error("Erro ao atualizar dados:", error);
      }
    } else {
      // Redirecionar se não estiver logado
      window.location.href = "https://www.dropaymentsmz.online/entrar";
    }
  });
}












// Função para enviar a solicitação de saque
document.getElementById("solicitarSaqueBtn").addEventListener("click", function (e) {
  e.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)
  const checkbox = document.getElementById("confirm");

    if (!checkbox.checked) {
      document.getElementById("response-message").style.color = "red";
      return document.getElementById("response-message").innerHTML = "Por favor, confirme a solicitação para continuar.";
    } else {
      console.log("")
    }
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    console.log(userId);


  // Pega o valor inserido no campo de saque
  const valorSolicitado = parseFloat(document.getElementById("valor").value);
  console.log(valorSolicitado)
  
  // Verifica se o valor solicitado é válido
  if (isNaN(valorSolicitado) || valorSolicitado <= 0) {
    alert("Por favor, insira um valor válido para o saque.");
    return;
  }

  // Exibe mensagem de carregamento enquanto faz a requisição
  document.getElementById("response-message").innerHTML = "Processando solicitação...";

  // Envia a requisição para a API
  fetch('https://www.dropaymentsmz.online/api/solicitar-saque', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId,
      valorSolicitado: valorSolicitado,
      type: "mpesa-emola"
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Saque solicitado com sucesso!') {
      // Exibe sucesso
      document.getElementById("response-message").innerHTML = "Saque realizado com sucesso!";
      document.getElementById("response-message").style.color = "green";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
      
    } else {
      // Exibe erro
      document.getElementById("response-message").innerHTML = data.message || "Erro desconhecido.";
      document.getElementById("response-message").style.color = "red";
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    document.getElementById("response-message").innerHTML = "Erro ao processar o saque.";
    document.getElementById("response-message").style.color = "red";
  });
} else {
  window.location.href = "entrar.html";
}
});














// Função para enviar a solicitação de saque
document.getElementById("solicitarSaquePayPal").addEventListener("click", function (e) {
  e.preventDefault(); // Impede o comportamento padrão do formulário (recarregar a página)
  const checkbox = document.getElementById("confirm-paypal");

    if (!checkbox.checked) {
      document.getElementById("response-message-2").style.color = "red";
      return document.getElementById("response-message-2").innerHTML = "Por favor, confirme a solicitação para continuar.";
    } else {
      console.log("")
    }
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    console.log(userId);


  // Pega o valor inserido no campo de saque
  const valorSolicitado = parseFloat(document.getElementById("valor-paypal").value);
  console.log(valorSolicitado)
  
  // Verifica se o valor solicitado é válido
  if (isNaN(valorSolicitado) || valorSolicitado <= 0) {
    alert("Por favor, insira um valor válido para o saque.");
    return;
  }

  // Exibe mensagem de carregamento enquanto faz a requisição
  document.getElementById("response-message-2").innerHTML = "Processando solicitação...";

  // Envia a requisição para a API
  fetch('https://www.dropaymentsmz.online/api/solicitar-saque', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: userId,
      valorSolicitado: valorSolicitado,
      type: "paypal"
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Saque solicitado com sucesso!') {
      // Exibe sucesso
      document.getElementById("response-message-2").innerHTML = "Saque realizado com sucesso!";
      document.getElementById("response-message-2").style.color = "green";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
      
    } else {
      // Exibe erro
      document.getElementById("response-message-2").innerHTML = data.message || "Erro desconhecido.";
      document.getElementById("response-message-2").style.color = "red";
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    document.getElementById("response-message-2").innerHTML = "Erro ao processar o saque.";
    document.getElementById("response-message-2").style.color = "red";
  });
} else {
  window.location.href = "entrar.html";
}
});



















// Inicializa a função de atualizar os dados ao carregar a página
atualizarDados();

  // Function to display the profile image of the logged-in user
  function displayUserProfileImage() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;
            const userRef = ref(db, `users/${userId}/profileFoto`);

            // Fetch the profile photo of the logged-in user
            get(userRef).then((snapshot) => {
                const usersContainer = document.getElementById('usersContainer');
                
                if (snapshot.exists()) {
                    const profilePhotoUrl = snapshot.val();
                    
                    // Create an image element and set the src to the profile photo URL
                    const imgElement = document.getElementById('profileFoto');
                    const imgElement1 = document.getElementById('profileFoto1');
                    imgElement.src = profilePhotoUrl;
                    imgElement.alt = `Foto de perfil do usuário`;
                    imgElement1.src = profilePhotoUrl;
                    imgElement.alt = `Foto de perfil do usuário`;
                    
                    
                    // Append the image to the container
                    usersContainer.appendChild(imgElement);
                } else {
                  console.error("Erro ao buscar a foto de perfil: ", error);
                }
            }).catch((error) => {
                console.error("Erro ao buscar a foto de perfil: ", error);
            });
        } else {
            // Redirect to login if no user is logged in
            window.location.href = "entrar.html";
        }
    });
}

// Call the function to display the image when the page loads
window.onload = displayUserProfileImage;


     // Função para obter os dados do usuário logado
     onAuthStateChanged(auth, (user) => {
      if (user) {
          const userId = user.uid; // Pega o uid do usuário logado
          const userRef = ref(db, 'users/' + userId);  // Correto: Usando 'realtimeDb'

          // Pegando os dados do usuário no Realtime Database
          get(userRef).then((snapshot) => {
              if (snapshot.exists()) {
                  const userData = snapshot.val();
                  document.getElementById('userEmail').textContent = userData.email;
                  document.getElementById('userName2').textContent = userData.name;
                  document.getElementById('userName').textContent = "Olá, " + userData.name;
              } else {
                  console.log("Nenhum dado disponível");
              }
          }).catch((error) => {
              console.error("Erro ao buscar os dados:", error);
          });
      } else {
          // Se não estiver logado, redirecionar para a página de login
          window.location.href = 'https://www.dropaymentsmz.online/entrar';
      }
  });

  // Função de logout
  const logoutButton = document.getElementById('logoutButton');
  logoutButton.addEventListener('click', () => {
      signOut(auth).then(() => {
          window.location.href = 'https://www.dropaymentsmz.online/entrar'; // Redirecionar para a página de login
      }).catch((error) => {
          console.error('Erro ao fazer logout:', error);
      });
  });