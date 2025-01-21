import { userMenu } from "../modals/user-info-menu.js";
import financeHub from "../pages/finances-hub.js";
import productHub from "../pages/product-hub.js";
import withdrawPage from "../pages/withdraw-hub.js";
import { displayBalnace, renderWithdrawHistory } from "../pages/withdraw-hub.js";
import { userPaymentData } from "../user/user_data.mjs";


export default function loadRender() {
    content.innerHTML = '';

    const load_template = ` <div class="loading-container">
    <div class="circle"></div>
    <span class="logo">D</span>
  </div>`;

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
    console.log('script criado : ', script);
    body.appendChild(script);
};







const content = document.getElementById('content');

//MOSTRAR E OCULTAR MENU FLUTUANTE DO USUARIO
const blur_div = document.getElementById('blur');
let u_state = false;
const open_user_menu = document.getElementById('open_user_menu');

open_user_menu.addEventListener('click', () => {
    u_state = !u_state;

    if (u_state === true) {
        blur_div.innerHTML = userMenu();
        setTimeout(() => {
            document.getElementsByClassName('user_info_menu')[0].classList.add('loaded');
        }, 50);
    } else if (u_state === false) {
        document.getElementsByClassName('user_info_menu')[0].remove();
    }
});


//ALTERNAR PAGINAS 

const init = () => {
    window.addEventListener('hashchange', () => {
        console.log(window.location.hash);
        switch (window.location.hash) {
            case '#panel':
                loadRender();
                setTimeout(() => {
                    content.innerHTML = '';
                    content.appendChild(financeHub());
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
                createScript('src/scripts/profile-function-page.js');
                break;
            default:
                break;
        }
    });
}
window.addEventListener('load', () => {

    function applFillters() {
        alert('xxxxxxxxxxxxx')
    }

    switch (window.location.hash) {
        case '#panel':
            loadRender();
            setTimeout(() => {
                content.innerHTML = ``;
                content.appendChild(financeHub());
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
            }, 1500);
            setTimeout(() => {
                displayBalnace();
                renderWithdrawHistory(10);
            }, 2500);
        case '#profile/user/data':
            createScript('src/scripts/profile-function-page.js');
            break;
        default:
            break;
    }

})
init();






