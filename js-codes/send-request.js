import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
    import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

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




document.getElementById("sendInfo").addEventListener('click', () => {
    
document.getElementById("sendInfo").textContent = "Enviando soliçitação..."; 

   
 const clientId = document.getElementById("clientID").textContent;
 const whatsappSeller = document.getElementById("whatsapp").value;
 const storeName = document.getElementById("storename").value;
 const storeUrl = document.getElementById("storeurl").value;
 const emailUser = document.getElementById("emailuser").value;
 
 
 
 // Envia o e-mail com o nome, e-mail e link para o documento
 fetch('https://www.dropaymentsmz.online/api/send-email', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        userId: clientId,
        whatsappBuyer: whatsappSeller,
        emailSeller: emailUser,
        storeName: storeName,
        storeUrl: storeUrl,
        timestamp: new Date().toISOString(),
        templateType: "4-S"
    })
}).then(response => {
    return response.json();
}).then(data => {
    document.getElementById("sendInfo").textContent = "Solicitação enviada!"; 
    console.log(data.message);



    const  status = "pending";

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userId = user.uid;
        const userConfigRef = ref(db, `users/${userId}/shopifyPLan/`);

        set(userConfigRef, {
          status: status,
        })
        .then(() => {
         console.log("estado salvo com sucesso.");
         const outPutrequest = document.getElementById("outPutrequest");
         outPutrequest.style.display = "block";
         outPutrequest.textContent = "Solicitação enviada com sucesso, dentro de 3 dias entraremos em contacto.";
         window.location.href = "index.html";
        })
        .catch((error) => {
          console.error('Erro ao salvar configurações:', error);
          const outPutrequest = document.getElementById("outPutrequest");
          outPutrequest.style.display = "block";
          outPutrequest.textContent = "Ocorreu um erro ao enviar a solicitação , por favor tente novamente.";
        });
      } else {
        console.log('Usuário não autenticado');
        window.location.href = "index.html";
      }
    });


}).catch(error => {
    console.error('Erro ao enviar o e-mail:', error);
    document.getElementById("sendInfo").textContent = "Erro aon enviar requisicao"; 
    console.log("erro ao enviar requisicao", error);
});

   
});
 
 
 
 
 
 
 
 
 
 
 
 
 