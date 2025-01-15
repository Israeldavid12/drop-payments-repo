// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
  const auth = getAuth();

  // Function to handle admin login
  function loginAdmin(email, password) {
    // Check if email matches the admin email
    if (email === "adm123456@gmail.com") {
      // Use Firebase Authentication to sign in the admin
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Login successful, redirect to pedidos-saques.html
          window.location.href = "pedidos-saques.html";
        })
        .catch((error) => {
          // Handle login error (e.g., wrong password)
          console.error("Login failed:", error);
          alert("Login falhou. Verifique seu e-mail e senha.");
        });
    } else {
      // If email is not the admin email, block access
      alert("Acesso negado. Somente administradores podem acessar.");
    }
  }

  // Example usage with form submission
  document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form from submitting

    // Get email and password from form inputs
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Call the loginAdmin function with the inputted credentials
    loginAdmin(email, password);
  });



