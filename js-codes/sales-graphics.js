  // Importa as funções do SDK do Firebase
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
  import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";

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

  // Inicializa Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getDatabase(app);
  const auth = getAuth();

  // Função para buscar dados e plotar gráfico
  function fetchDataAndPlotChart(userId) {
      const paymentsRef = ref(db, `users/${userId}/payments`);

      // Lê os dados do Firebase Realtime Database
      onValue(paymentsRef, (snapshot) => {
          const paymentsData = snapshot.val();
          const labels = [];
          const sales = [];

          // Percorre os dados para extrair as datas e valores de vendas
          for (const key in paymentsData) {
              if (paymentsData.hasOwnProperty(key)) {
                  const payment = paymentsData[key];
                  const timestamp = payment.timestamp;
                  const originalAmount = payment.originalAmount;

                  // Formata a data para o gráfico
                  const date = new Date(timestamp);
                  const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

                  labels.push(formattedDate);  // Adiciona a data ao eixo X
                  sales.push(originalAmount);  // Adiciona o valor de vendas
              }
          }

          // Atualiza o gráfico com os novos dados
          updateChart(labels, sales);
      });
  }

  // Função para criar ou atualizar o gráfico Chart.js
  function updateChart(labels, data) {
      const ctx = document.getElementById('salesChart').getContext('2d');
      const chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: labels,  // Datas
              datasets: [{
                  label: 'MZN',
                  data: data,  // Valores das vendas
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              }
          }
      });
  }

  // Autenticação: Verifica se o usuário está logado e busca os dados
  onAuthStateChanged(auth, (user) => {
      if (user) {
          const userId = user.uid;
          fetchDataAndPlotChart(userId);
      } else {
          console.log("Usuário não está logado");
      }
  });