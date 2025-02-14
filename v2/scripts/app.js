


















function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('mpesaPopup').style.display = 'none';
}
// Função de contagem regressiva
let timeLeft = 200; // 3.33 minutos em segundos
const timerElement = document.getElementById("timer");

function startCountdown() {
    const countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown);
            timerElement.innerHTML = "Tempo Esgotado!";
        } else {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            timerElement.innerHTML = `00 : ${minutes < 10 ? '0' : ''}${minutes} : ${seconds}`;
            timeLeft--;
        }
    }, 1000);
}

startCountdown();

// Função para selecionar M-Pesa
function selectMpesa() {
    document.getElementById("mpesa").classList.remove("selected");
    document.getElementById("emola").classList.remove("selected");
    document.getElementById("pay-btn").innerHTML = "Pagar com M-Pesa";
    document.getElementById("pay-btn").classList.remove("e-mola");
    document.getElementById("mpesa").classList.add("selected");
    document.getElementById("paypal").classList.remove("selected");
    document.getElementById("pay-btn").classList.remove('paypal-button');
    document.getElementsByClassName('input-container')[4].style.display = 'flex';

    // Alterar placeholder para M-Pesa
    document.getElementById("paynumber").placeholder = "Digite seu número M-Pesa";
}

// Função para selecionar e-Mola
function selectEmola() {
    document.getElementById("mpesa").classList.remove("selected");
    document.getElementById("mpesa").classList.remove("mpesa");
    document.getElementById("emola").classList.remove("selected");
    document.getElementById("pay-btn").innerHTML = "Pagar com E-Mola";
    document.getElementById("pay-btn").classList.add("e-mola");
    document.getElementById("emola").classList.add("selected");
    document.getElementById("paypal").classList.remove("selected");
    document.getElementById("pay-btn").classList.remove('paypal-button');
    document.getElementsByClassName('input-container')[4].style.display = 'flex';
    // Alterar placeholder para E-Mola
    document.getElementById("paynumber").placeholder = "Digite seu número E-Mola";
}
function selectPayPal() {
    document.getElementById("paypal").classList.add("selected");
    document.getElementById("pay-btn").classList.remove("e-mola");
    document.getElementById("pay-btn").classList.remove("mpesa");
    document.getElementById("mpesa").classList.remove("mpesa");
    document.getElementById("emola").classList.remove("selected");
    document.getElementById("mpesa").classList.remove("selected");
    document.getElementById("pay-btn").innerHTML = "Pagar com Paypal";
    document.getElementById("pay-btn").classList.add('paypal-button');
    document.getElementsByClassName('input-container')[4].style.display = 'none';
}




const hash = window.location.hash
console.log(hash)