export function addLoadAnim(id, text, flag) {
    const btn = document.getElementById(id);
    const btn_text = btn.textContent;
    if (btn) {
        if (flag === true) {
            btn.innerHTML = ` <i class="fas fa-circle-notch fa-spin spinner" ></i> ${text}`;
            btn.style.opacity = '65%';
            btn.disabled = true;

        } else if (flag === false) {
            btn.innerHTML = `${text}`;
            btn.style.opacity = '100%';
            btn.disabled = false;
        }
    } else {
        return console.error('O botao nao existe');
    }

}


export function setAnOutPut(text, type) {
    //const element = document.getElementById(id); // Referência ao elemento com o ID
    const container = document.getElementById('content'); // Contêiner principal onde as mensagens serão adicionadas

    // Cria a nova div
    const div = document.createElement('div');

    // Template do conteúdo da div
    const template = `
        <p>${text}</p>
        <i class="bi bi-x-circle-fill" style="cursor: pointer;"></i>
    `;

    // Configurações para mensagens de sucesso ou erro
    if (type === 'S-M') {
        div.classList.add('sucess-alert'); // Adiciona classe para mensagens de sucesso
    } else if (type === 'E-M') {
        div.classList.add('error-alert'); // Adiciona classe para mensagens de erro
    }

    div.innerHTML = template; // Define o conteúdo da div
    container.insertBefore(div, container.firstChild); // Insere a div no início do contêiner
    div.scrollIntoView({ behavior: 'smooth' }); // Faz o scroll suave até a nova div

    // Adiciona evento ao ícone para remover a div
    const closeIcon = div.querySelector('.bi-x-circle-fill');
    closeIcon.addEventListener('click', () => {
        div.remove(); // Remove a div correspondente
    });
}



export async function pageLoader(flag) {
    const div = document.createElement('div');
    div.classList.add('load-container')
    const template = ` <div class="page-loader" >
        <div class='l-container'> <div class="loading-container">
            <div class="circle"></div>
            <span class="logo">D</span>
          </div> </div>
    </div>`;

    if (flag === true) {
        div.innerHTML = template;
        const body = document.body;
        body.insertBefore(div, body.firstChild);
    } else if (flag === false) {
        const body = document.body;
        body.querySelector('.page-loader').remove();
    }
}


export function showAnPopup(template1, flag) {
    const overlay = document.querySelector('.overlay-popup');

    if (!overlay) {
        console.error("Elemento '.overlay-popup' não encontrado.");
        return;
    }

    if (flag === true) {
        const template = document.createElement('div');
        template.innerHTML = template1;
        overlay.innerHTML = ''; // Limpa o conteúdo anterior
        overlay.appendChild(template);

        // Define visibilidade antes de iniciar a transição
        overlay.style.display = 'flex';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';

        // Usa um pequeno timeout para permitir a transição
        setTimeout(() => {
            overlay.classList.add("show");
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
        }, 10); // Pequeno atraso para garantir que o navegador processe a exibição
    } else if (flag === false) {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';

        // Espera a transição antes de remover do fluxo do layout
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 200); // Tempo igual à transição no CSS
    } else {
        console.error('ERRO DE CHAMADA {setPopup} - flag inválida');
        return
    }
}


export const formatBalance = (balance, currency) => {
    const formatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currency,
    });
    const f_balance = formatter.format(balance || 0);
    
    return f_balance;
}