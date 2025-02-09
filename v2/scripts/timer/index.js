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


 startCountdown()