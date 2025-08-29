import { setAnOutPut } from "../../animations/index.js";
import { userMenu } from "../../modals/user-info-menu.js";
import { NotificationsModal } from "../../modals/notifications-modal.js";









document.addEventListener('submit', async function (event) {
  if (event.target.id === 'feedback-form') {
    try {
      event.preventDefault();
      const formData = new FormData(event.target);
      const feedback_data = Object.fromEntries(formData.entries());
      console.log(feedback_data);
      const send = await axios.post('https://www.dropaymentsmz.online/api/v2/smtp/send-email', {
        templateType: '11-FEEDBACK',
        ...feedback_data
      });

      console.log(send.data)
      setAnOutPut(send.data.message, "S-M")

    } catch (error) {
      console.log(error)
      setAnOutPut("Erro ao enviar o formulário", "E-M")

    }
  }
});

function setTheme() {
  const theme = localStorage.getItem('theme');

  if (theme === 'dark') {
    document.getElementById('sidebar').classList.remove('light-theme');
  } else {
    document.getElementById('sidebar').classList.add('light-theme');
    document.querySelectorAll('.side-item').forEach(item => item.classList.remove('active'));
  }
}

let state = true;
document.body.addEventListener('click', function (event) {
  if (event.target && event.target.matches('.change-theme')) {
    state = !state;
    localStorage.setItem('theme', state ? 'dark' : 'light');
    const theme = localStorage.getItem('theme');
    console.log(theme)


    if (theme === 'dark') {
      document.getElementById('sidebar').classList.remove('light-theme');
    } else {
      document.getElementById('sidebar').classList.add('light-theme');
      document.querySelectorAll('.side-item').forEach(item => item.classList.remove('active'));
    }
  }
});

setTheme();




//MOSTRAR E OCULTAR MENU FLUTUANTE DO USUARIO
const blur_div = document.getElementById('blur');
let u_state = false;
const open_user_menu = document.getElementById('open_user_menu');

open_user_menu.addEventListener('click', async () => {
    u_state = !u_state;

    if (u_state === true) {
        blur_div.innerHTML = await userMenu();
        setTimeout(() => {
            document.getElementsByClassName('user_info_menu')[0].classList.add('loaded');
        }, 50);
    } else if (u_state === false) {
        document.getElementsByClassName('user_info_menu')[0].remove();
    }
});





//MOSTRAR E OCULTAR NOTIFICACOES
const notification = document.getElementById('open_notifications');
const not_div = document.getElementById('not');
let n_state = true;

notification.addEventListener('click', async () => {
    n_state = !n_state;

    if (n_state === true) {
        not_div.innerHTML = await NotificationsModal();
    } else if (n_state === false) {
        document.querySelector('.notifications-modal').remove();
    }
});