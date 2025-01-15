import home from './pages/home/index.js';
import { casaPage } from './pages/inicio/index.js';
import shopify from './pages/shopify/index.js';
import credScreen from './pages/shopify/credscree.js';
import createProduct from './pages/shopify/product.js';
import saquepopup from './pages/components/modals.js';



const createScript = (dir__name) => {
    const head = document.head;
    const script = document.createElement('script');
    script.src = dir__name;
    script.type = 'module';
    console.log('script criado : ', script);
    head.appendChild(script);
};


// URL da API REST Countries
const apiUrl = "https://restcountries.com/v3.1/all";

// Elemento do dropdown
const countryDropdown = document.getElementById("countryDropdown");

// Função para carregar países
async function loadCountries() {
    try {
        const response = await fetch(apiUrl); // Faz a requisição à API
        const countries = await response.json(); // Converte a resposta para JSON

        // Ordena os países pelo nome
        countries.sort((a, b) => a.name.common.localeCompare(b.name.common));

        // Popula o dropdown

        countries.forEach(country => {
            const option = document.createElement("option");
            option.value = country.cca2; // Código do país (ISO 3166-1 alfa-2)
            option.textContent = country.name.common; // Nome do país
            countryDropdown.appendChild(option);
            console.log('sucess');
        });
    } catch (error) {
        console.error("Erro ao carregar os países:", error);
        countryDropdown.innerHTML = "<option value=''>Erro ao carregar</option>";
    }
}





function setLoading1() {
    document.getElementById('loader').style.display = 'flex';
    //document.getElementById('loader').innerHTML = ' <i class="fas fa-circle-notch fa-spin fa-2x"></i>';
    document.getElementById('content').style.display = 'none';


}
function setLoading2() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('content').style.display = 'flex';


}




const content = document.getElementById('content');



console.log(window.location.hash);



const init = () => {
    window.addEventListener('hashchange', () => {

        console.log(window.location.hash);
        content.innerHTML = '';
        switch (window.location.hash) {
            case '#/home':
                content.innerHTML = '';
                setTimeout(setLoading1);
                setTimeout(setLoading2, 2000);
                content.appendChild(home());
                if (window.location.hash) {
                    history.replaceState(null, null, window.location.href.split('#')[0]);
                  }
                break;
            case '#inicio':
                content.innerHTML = '';
                setTimeout(setLoading1);
                setTimeout(setLoading2, 2000);
                content.appendChild(casaPage());
                content.appendChild(saquepopup());
                createScript('./status-user.js');
                break;
            case '#shopify':
                content.innerHTML = ``;
                setTimeout(setLoading1);
                setTimeout(setLoading2, 2000);
                content.appendChild(shopify());
                break;
            case '#api/credentials':
                content.innerHTML = ``;
                setTimeout(setLoading1);
                setTimeout(setLoading2, 2000);
                content.appendChild(credScreen());
                content.style.backgroundColor = '#fff';
                break;
            case '#create/product':
                setTimeout(setLoading1);
                setTimeout(setLoading2, 2000);
                content.appendChild(createProduct());
                setTimeout(() => {
                    loadCountries();
                }, 3000);                          
                break;
            case '#state1':
                setTimeout(setLoading1);
                setTimeout(setLoading2, 2000);
                content.appendChild(shopify());
               setTimeout(() => {
                document.getElementById('box').style.display = 'none';
               }, 2000);
                console.log('1');
                break;
            default:
                content.innerHTML = '<h1> 404 PAGINA NAO ENCONTRADA </h1>';
        }

    });
}



window.addEventListener('load', () => {


    if (window.location.hash === '#/home') {
        content.innerHTML = '';
        content.appendChild(home());
    }
    if (window.location.hash === '#tela2') {
        content.innerHTML = '<h1> PAGINA 2 </h1>';
    }
    if (window.location.hash === '#inicio') {
        content.innerHTML = '';
        setTimeout(setLoading1);
        setTimeout(setLoading2, 2000);
        content.appendChild(casaPage());
    }
    if (window.location.hash === '#shopify') {
        content.innerHTML = '';
        setTimeout(setLoading1);
        setTimeout(setLoading2, 2000);
        content.appendChild(shopify());
    }
    if (window.location.hash === '#api/credentials') {
        content.innerHTML = ``;
        setTimeout(setLoading1);
        setTimeout(setLoading2, 2000);
        content.appendChild(credScreen());
    }
    if (window.location.hash === '#create/product') {
        content.innerHTML = ``;
        setTimeout(setLoading1);
        setTimeout(setLoading2, 2000);
        content.appendChild(createProduct());
    }

});

init();