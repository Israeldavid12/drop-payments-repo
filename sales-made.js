const notification = document.getElementById('purchase-notification');
const buyerNameSpan = document.getElementById('buyer-name');
const closeBtn = document.getElementById('close-notification');

// Lista de nomes de compradores
const buyers = [
    "Fíneas Betuele",
    "Ana Rita",
    "Carlos Sitoe",
    "Mariana Oliveira",
    "Lucas Antonio",
    "Mario Jose",
    "Josefina Pedro",
    "Patricia Antonio"
];

let currentBuyerIndex = 0;

// Função para exibir a notificação
function showNotification() {
    // Atualiza o nome do comprador
    buyerNameSpan.textContent = buyers[currentBuyerIndex];

    // Exibe a notificação
    notification.classList.remove('hidden');
    notification.classList.add('visible');

    // Alterna para o próximo nome
    currentBuyerIndex = (currentBuyerIndex + 1) % buyers.length;

    // Esconde a notificação após 5 segundos
    setTimeout(hideNotification, 5000);
}

// Função para ocultar a notificação
function hideNotification() {
    notification.classList.remove('visible');
    notification.classList.add('hidden');
}

// Exibe a notificação a cada 17 segundos
setInterval(showNotification, 17000);

// Permite fechar a notificação ao clicar no botão de fechar
closeBtn.addEventListener('click', hideNotification);
