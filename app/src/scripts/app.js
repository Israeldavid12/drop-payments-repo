import { userMenu } from "../modals/user-info-menu.js";
import { financeHub } from "../pages/finances-hub.js";
import { productHub, displayProducts } from "../pages/product-hub.js";
import withdrawPage from "../pages/withdraw-hub.js";
import { displayBalnace, renderWithdrawHistory } from "../pages/withdraw-hub.js";
import { profilePage } from "../pages/profile-hub.js";
import { addLoadAnim, pageLoader } from "../animations/index.js";
import { createProduct } from "../pages/create-product.js";











export default function loadRender(flag) {
    if (flag === true) {
        content.innerHTML = '';

        const load_template = `<div class='l-container'> <div class="loading-container">
    <div class="circle"></div>
    <span class="logo">D</span>
  </div> </div> `;

        content.innerHTML = load_template;

        return load_template;
    } else if (flag === false) {
        const loader = document.querySelector('l-container');
        loader.remove()
    }
}

export function setMaxEntries() {
    const entries = document.getElementById('entries').value;
    return entries;
}

function changeTitle(title_text) {
    document.title = title_text;
}

const createScript = (dir__name) => {
    const body = document.body;
    const script = document.createElement('script');
    script.src = dir__name;
    script.type = 'module';
    body.appendChild(script);
};

const removeScript = (dir_name) => {
    // Seleciona a tag <script> com o atributo src igual a dir_name
    const scriptTag = document.querySelector(`script[src="${dir_name}"]`);

    if (scriptTag) {
        scriptTag.remove(); // Remove a tag do DOM
        console.log(`Script com src "${dir_name}" removido com sucesso!`);
    } else {
        console.log(`Script com src "${dir_name}" não encontrado.`);
    }
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
                loadRender(true);
                setTimeout(async () => {
                    changeTitle('Dashboard');
                    content.innerHTML = '';
                    content.appendChild(await financeHub());
                    createScript('src/scripts/page-functions/finaces-hub.js')
                    location.reload();
                }, 2000);

                break;
            case '#products/my':
                loadRender(true);
                setTimeout(async () => {
                    changeTitle('Produtos');
                    content.innerHTML = '';
                    content.appendChild(productHub());
                    await displayProducts();
                }, 2000);
                break;
            case '#withdraw':
                loadRender(true);
                setTimeout(() => {
                    changeTitle('Saques');
                    content.innerHTML = '';
                    content.appendChild(withdrawPage());
                    createScript('src/modals/solicitar-saque.js');
                }, 2000);
                setTimeout(() => {
                    displayBalnace();
                    renderWithdrawHistory();
                }, 3000);
                break;
            case '#profile/user/data':
                loadRender(true);
                setTimeout(async () => {
                    location.reload();
                    changeTitle('Perfil');
                    content.innerHTML = '';
                    content.appendChild(await profilePage());
                    createScript('src/scripts/page-functions/profile-function-page.js');

                }, 2000);
                break;
            case '#/create/product':
                loadRender(true);
                setTimeout(async () => {
                    changeTitle('Criar produto');
                    content.innerHTML = '';
                    content.appendChild(await createProduct());
                    createScript('src/scripts/page-functions/create-product-hub.js');
                }, 2000)
                break;
            default:
                break;
        }
    });
}
window.addEventListener('load', async () => {

    switch (window.location.hash) {
        case '#panel':
            pageLoader(true);
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Dashboard');
                content.innerHTML = ``;
                content.appendChild(await financeHub());
                createScript('src/scripts/page-functions/finaces-hub.js')
            }, 2500);
            break;
        case '#products/my':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Produtos');
                content.innerHTML = '';
                content.appendChild(productHub());
                await displayProducts();
            }, 2000);
            break;
        case '#withdraw':
            loadRender(true);
            setTimeout(() => {
                changeTitle('Saques');
                content.innerHTML = '';
                content.appendChild(withdrawPage());
                createScript('src/modals/solicitar-saque.js')
            }, 1500);
            setTimeout(() => {
                displayBalnace();
                renderWithdrawHistory(10);
            }, 2500);
            break;
        case '#profile/user/data':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Perfil');
                console.log('Clearing content...');
                content.innerHTML = '';
                console.log('Appending profilePage...');
                pageLoader(true);
                content.appendChild(await profilePage());
                console.log('Awaiting handleUserData...');
                //  removeScript('src/scripts/profile-function-page.js');
                console.log('Creating script...');
                createScript('src/scripts/page-functions/profile-function-page.js');

            }, 1000);
            break;
        case '#/create/product':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Criar produto');
                content.innerHTML = '';
                content.appendChild(await createProduct());
                createScript('src/scripts/page-functions/create-product-hub.js');
            }, 2000)
            break;
        default:
            break;
    }

})
init();






