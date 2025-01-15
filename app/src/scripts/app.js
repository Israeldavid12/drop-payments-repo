import { userMenu } from "../modals/user-info-menu.js";
import financeHub from "../pages/finances-hub.js";
import productHub from "../pages/product-hub.js";

const load_template = ` <div class="loading-container">
                <div class="circle"></div>
                <span class="logo">D</span>
              </div>`;


const content = document.getElementById('content');
const div = document.createElement('div');
div.innerHTML = financeHub();

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
                content.innerHTML = '';
                content.innerHTML = load_template;
                setTimeout(() => {
                    content.innerHTML = '';
                    content.appendChild(financeHub());
                }, 2000);

                break;
            case '#products/my':
                content.innerHTML = '';
                content.innerHTML = load_template;
                setTimeout(() => {
                    content.innerHTML = '';
                    content.appendChild(productHub());
                }, 2000);
                break;
            default:
                break;
        }
    });
}
window.addEventListener('load', () => {
    switch (window.location.hash) {
        case '#panel':
            setTimeout(() => {
                content.innerHTML = ``;
                content.appendChild(financeHub());
            }, 2000);

            break;
        case '#products/my':
            setTimeout(() => {
                content.innerHTML = '';
                content.appendChild(productHub());
            }, 2000);
            break;
        default:
            break;
    }

})
init();






