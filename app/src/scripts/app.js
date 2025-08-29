import { financeHub, setLastSale } from "../pages/finances-hub.js";
import { displayProduct } from "./displayProducts/init.js";
import withdrawPage from "../pages/withdraw-hub.js";
import { displayBalnace, renderWithdrawHistory } from "../pages/withdraw-hub.js";
import { addLoadAnim, pageLoader, setAnOutPut, showAnPopup } from "../animations/index.js";
import { UserData } from "../user/v2/userData.js";
import { displaySales, salesPage } from "../pages/sales-hub.js";
import { settingsPage } from "../pages/checkout-settings.js";
import { feedbackPage } from "../pages/send-feedback-hub.js";
import { Pages } from "../pages/getAllPage.js";







const content = document.getElementById('content');

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
    console.log(`Script "${dir__name}" adicionado com sucesso!`);
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








//ALTERNAR PAGINAS 
window.addEventListener('hashchange', async () => {

    const hash = window.location.hash;
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
                content.appendChild( await Pages.productHub());
                // await displayProducts();
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
                content.appendChild(await Pages.profilePage());
                createScript('src/scripts/page-functions/profile-function-page.js');

            }, 2000);
            break;
        case '#/create/product':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Criar produto');
                content.innerHTML = '';
                content.appendChild(await Pages.createProduct());
                createScript('src/scripts/createProduct/init.js');
            }, 2000)
            break;
        case '#/vendas':
            loadRender(true);
            setTimeout(async () => {
                location.reload()
            }, 2000);
            break;
        case '#checkout/settings':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Definicoes do checkout');
                content.innerHTML = '';
                content.appendChild(await settingsPage());
                createScript('src/scripts/page-functions/checkout-settings-hub.js');
            }, 2000)
            break;
        case "#logout":
            await UserData.logout();
            break;
        case '#/feedback':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Definicoes do checkout');
                content.innerHTML = '';
                content.appendChild(await feedbackPage());
            }, 2000)
            break;
        default:
            break;
    }

    if (hash.startsWith('#/exclude/payout/method')) {
        const match = hash.match(/id=(\d+)/); // extrai o id
        const id = match ? match[1] : null;
        console.log(id);
        UserData.deleleData(id, 'payout_methods', '#profile/user/data');

    }
    if (hash.startsWith('#/edit/payout/method')) {
        const match = hash.match(/id=(\d+)/); // extrai o id
        const id = match ? match[1] : null;
        console.log(id);
        removeScript('src/scripts/page-functions/edit/payoutMethod.js');
        pageLoader(true);
        setTimeout(async () => {
            changeTitle('Dashboard');
            content.innerHTML = '';
            content.appendChild(await Pages.editPayoutsMethds());
            await UserData.setPayoutMethod(id);
            createScript('src/scripts/page-functions/edit/payoutMethod.js');
            pageLoader(false);
        }, 2000);

    }
});
window.addEventListener('load', async () => {
    const hash = window.location.hash;

    switch (window.location.hash) {
        case '#panel':
            // pageLoader(true);
            // loadRender(true);
            setTimeout(async () => {
                changeTitle('Dashboard');
                content.innerHTML = ``;
                content.appendChild(await financeHub());
                await setLastSale();
                createScript('src/scripts/page-functions/finaces-hub.js')
            }, 2500);
            break;
        case '#products/my':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Produtos');
                content.innerHTML = '';
                content.appendChild( await Pages.productHub());
                await displayProduct();
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
                content.appendChild(await Pages.profilePage());
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
                content.appendChild(await Pages.createProduct());
                createScript('src/scripts/createProduct/init.js');
            }, 2000)
            break;
        case '#/vendas':
            loadRender(true);

            setTimeout(async () => {
                changeTitle("Vendas")
                content.innerHTML = '';
                content.appendChild(await salesPage())
                await displaySales()
            }, 2000);
            break;
        case '#checkout/settings':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Definicoes do checkout');
                content.innerHTML = '';
                content.appendChild(await settingsPage());
                createScript('src/scripts/page-functions/checkout-settings-hub.js');
            }, 2000)
            break;
        case '#/feedback':
            loadRender(true);
            setTimeout(async () => {
                changeTitle('Definicoes do checkout');
                content.innerHTML = '';
                content.appendChild(await feedbackPage());
            }, 2000)
            break;

        default:
            break;
    }

    if (hash.startsWith('#/edit/payout/method')) {
        const match = hash.match(/id=(\d+)/); // extrai o id
        const id = match ? match[1] : null;
        console.log(id);
        pageLoader(true);
        setTimeout(async () => {
            changeTitle('Dashboard');
            content.innerHTML = '';
            content.appendChild(await Pages.editPayoutsMethds());
            await UserData.setPayoutMethod(id);
            createScript('src/scripts/page-functions/edit/payoutMethod.js');
            pageLoader(false);


        }, 2000);

    }

})







