import { setAnOutPut } from "../../animations/index.js";

document.addEventListener('submit', async function (event) {
  if (event.target.id === 'feedback-form') {
    try {
      event.preventDefault();
      const formData = new FormData(event.target);
      const feedback_data = Object.fromEntries(formData.entries());
      console.log(feedback_data);
      const send = await axios.post('http://127.0.0.1:3002/api/v2/smtp/send-email', {
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