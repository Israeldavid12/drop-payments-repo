import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Função para buscar e exibir saques de todos os usuários
function fetchAllWithdrawals() {
  const usersRef = ref(database, `users/`);
  const withdrawalsDiv = document.getElementById('withdrawals');

  // Verificar se a div de saques existe no DOM
  if (!withdrawalsDiv) {
    console.error('Erro: Elemento withdrawals não encontrado no DOM.');
    return;
  }

  withdrawalsDiv.innerHTML = ''; // Limpar a div para evitar duplicação

  // Recuperar dados de todos os usuários
  onValue(usersRef, (usersSnapshot) => {
    if (!usersSnapshot.exists()) {
      withdrawalsDiv.innerHTML = '<p>Nenhum usuário encontrado.</p>';
      console.warn('Nenhum usuário encontrado no banco de dados.');
      return;
    }

    usersSnapshot.forEach((userSnapshot) => {
      const userId = userSnapshot.key; // ID do usuário
      const userData = userSnapshot.val();

      // Buscar o histórico de saques de cada usuário
      const withdrawalsRef = ref(database, `users/${userId}/withdrawHistory/`);
      const paymentMethodsRef = ref(database, `users/${userId}/userpaymentMethods/`);

      onValue(withdrawalsRef, (snapshot) => {
        if (!snapshot.exists()) {
          withdrawalsDiv.innerHTML += `<p>Nenhum saque encontrado para o usuário ${userId}.</p>`;
          console.warn(`Nenhum saque encontrado para o usuário ${userId}.`);
          return;
        }

        snapshot.forEach((childSnapshot) => {
          const withdrawal = childSnapshot.val();
          const withdrawalId = childSnapshot.key;

          // Verificar se os dados de saque estão completos
          if (!withdrawal || !withdrawal.metodo || !withdrawal.valueAmount || !withdrawal.status) {
            console.warn('Dados incompletos para o saque:', withdrawal);
            withdrawalsDiv.innerHTML += `<div><p>Erro: Dados incompletos para o saque ${withdrawalId}.</p></div>`;
            return;
          }

          // Acessar os dados de userpaymentMethods
          onValue(paymentMethodsRef, (paymentMethodsSnapshot) => {
            const paymentMethods = paymentMethodsSnapshot.val();

            // Verificar se os métodos de pagamento existem
            if (!paymentMethods) {
              console.warn(`Nenhum método de pagamento encontrado para o usuário ${userId}.`);
              withdrawalsDiv.innerHTML += `<div><p>Erro: Nenhum método de pagamento encontrado para o usuário ${userId}.</p></div>`;
              return;
            }

            const numero = paymentMethods.numero || 'N/A';
            const titular = paymentMethods.titular || 'N/A';
            const whatsapp = paymentMethods.whatsapp || 'N/A';

            // Criar o elemento do saque
            const withdrawalElement = document.createElement('div');
            withdrawalElement.innerHTML = `
              <h3>Saque ${withdrawalId} (Usuário: ${userId})</h3>
              <p>Método: ${withdrawal.metodo}</p>
              <p>Status: ${withdrawal.status}</p>
              <p>Valor Solicitado: ${withdrawal.valueAmount}</p>
              <p>Valor Pago: ${withdrawal.amountPaid || 'N/A'}</p>
              <p>Timestamp: ${withdrawal.timestamp || 'N/A'}</p>
              <p>Número: ${numero}</p>
              <p>Titular: ${titular}</p>
              <p>WhatsApp: ${whatsapp}</p>
              <button onclick="updateStatus('${userId}', '${withdrawalId}', 'concluido')">Marcar como Concluído</button>
              <button onclick="updateStatus('${userId}', '${withdrawalId}', 'pendente')">Marcar como Pendente</button>
              <hr/>
            `;
            withdrawalsDiv.appendChild(withdrawalElement); // Adiciona o novo saque ao DOM
          }, (error) => {
            // Tratamento de erro para a consulta de métodos de pagamento
            console.error('Erro ao buscar métodos de pagamento:', error);
            withdrawalsDiv.innerHTML += `<p>Erro ao buscar métodos de pagamento para o usuário ${userId}.</p>`;
          });
        });
      }, (error) => {
        // Tratamento de erro para a consulta de saques
        console.error(`Erro ao buscar saques para o usuário ${userId}:`, error);
        withdrawalsDiv.innerHTML += `<p>Erro ao buscar saques para o usuário ${userId}: ${error.message}</p>`;
      });
    });
  }, (error) => {
    console.error('Erro ao buscar usuários:', error);
    withdrawalsDiv.innerHTML = `<p>Erro ao buscar usuários: ${error.message}</p>`;
  });
}

// Função para atualizar o status do saque com tratamento de erros
function updateStatus(userId, withdrawalId, status) {
  if (!userId || !withdrawalId || !status) {
    console.error('Erro: Parâmetros inválidos ao tentar atualizar o status.');
    alert('Erro: Não foi possível atualizar o status.');
    return;
  }

  const withdrawalRef = ref(database, `users/${userId}/withdrawHistory/${withdrawalId}`);

  update(withdrawalRef, {
    status: status
  }).then(() => {
    alert(`Status do saque ${withdrawalId} do usuário ${userId} atualizado para ${status}`);
  }).catch((error) => {
    console.error("Erro ao atualizar o status:", error);
    alert('Erro ao atualizar o status. Por favor, tente novamente.');
  });
}

// Torna as funções acessíveis no escopo global
window.updateStatus = updateStatus; // Agora o updateStatus está acessível no escopo global
// Chamar a função para buscar os saques de todos os usuários
fetchAllWithdrawals();
