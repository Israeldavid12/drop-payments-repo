import { userMenu } from "../modals/user-info-menu.js";
import { financeHub } from "../pages/finances-hub.js";
import productHub from "../pages/product-hub.js";
import withdrawPage from "../pages/withdraw-hub.js";
import { displayBalnace, renderWithdrawHistory } from "../pages/withdraw-hub.js";
import { profilePage } from "../pages/profile-hub.js";
import { handleUserData } from "./profile-function-page.js";


export default function loadRender() {
    content.innerHTML = '';

    const load_template = `<div class='l-container'> <div class="loading-container">
    <div class="circle"></div>
    <span class="logo">D</span>
  </div> </div> `;

    content.innerHTML = load_template;

    return load_template;
}

export function setMaxEntries() {
    const entries = document.getElementById('entries').value;
    return entries;
}


const createScript = (dir__name) => {
    const body = document.body;
    const script = document.createElement('script');
    script.src = dir__name;
    script.type = 'module';
    body.appendChild(script);
};










const content = document.getElementById('content');

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


//ALTERNAR PAGINAS 

const init = () => {
    window.addEventListener('hashchange', async () => {
        console.log(window.location.hash);
        switch (window.location.hash) {
            case '#panel':
                loadRender();
                setTimeout(async () => {
                    content.innerHTML = '';
                    content.appendChild(await financeHub());
                }, 2000);

                break;
            case '#products/my':
                loadRender();
                setTimeout(() => {
                    content.innerHTML = '';
                    content.appendChild(productHub());
                }, 2000);
                break;
            case '#withdraw':
                loadRender();
                setTimeout(() => {
                    content.innerHTML = '';
                    content.appendChild(withdrawPage());
                }, 2000);
                setTimeout(() => {
                    displayBalnace();
                    renderWithdrawHistory();
                }, 3000);
                break;
            case '#profile/user/data':
                loadRender();
                setTimeout(async () => {
                    content.innerHTML = '';
                    content.appendChild(profilePage());
                    await handleUserData();
                }, 2000);
                break; 
            default:
                break;
        }
    });
}
window.addEventListener('load', async () => {

    function applFillters() {
        alert('xxxxxxxxxxxxx')
    }

    switch (window.location.hash) {
        case '#panel':
            loadRender();
            setTimeout(async () => {
                content.innerHTML = ``;
                content.appendChild(await financeHub());
            }, 2500);
            break;
        case '#products/my':
            loadRender();
            setTimeout(() => {
                content.innerHTML = '';
                content.appendChild(productHub());
            }, 2000);
            break;
        case '#withdraw':
            loadRender();
            setTimeout(() => {
                content.innerHTML = '';
                content.appendChild(withdrawPage());
            }, 1500);
            setTimeout(() => {
                displayBalnace();
                renderWithdrawHistory(10);
            }, 2500);
            break;
        case '#profile/user/data':
            loadRender();
            setTimeout( async() => {
                content.innerHTML = '';
                content.appendChild(profilePage());
                await handleUserData();
            }, 2000);
            break;
        default:
            break;
    }

})
init();






