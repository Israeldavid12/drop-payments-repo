const admin = require("firebase-admin");


// Função para inicializar o Firebase
const serviceAccount = require("../../credentials/drop-payments-mz-firebase-adminsdk-bzvcd-4807201303.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://drop-payments-mz-default-rtdb.europe-west1.firebasedatabase.app", 
});

module.exports = admin