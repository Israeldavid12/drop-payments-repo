document.addEventListener('DOMContentLoaded', function () {
    const dynamicValueElement = document.querySelector('.dynamic-value');

    function updateValue() {
        const minValue = 1000000;
        const maxValue = 2000000;
        const randomValue = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        dynamicValueElement.textContent = randomValue.toLocaleString('pt-MZ') + ' MT';
    }

    setInterval(updateValue, 2000);
});

document.getElementById('getStarted').addEventListener('click', function() {
    window.location.href = "criar-conta.html";
});

document.getElementById('getStarted2').addEventListener('click', function() {
    window.location.href = "criar-conta.html";
});

document.getElementById('login').addEventListener('click', function() {
    window.location.href = "entrar.html";
});

document.getElementById('support').addEventListener('click', function() {
    window.location.href = "entrar.html";
});