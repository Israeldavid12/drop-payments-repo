import { UserData } from "../../user/v2/userData.js";
import { pageLoader, showAnPopup } from "../../animations/index.js";



export async function displayProduct() {
    pageLoader(true)
    const products = await UserData.getProducts();

    if (products) {
        const productCard = document.getElementById('product-grid');
        productCard.innerHTML = '';
        pageLoader(false)

        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            console.log(product.id)

            const div = document.createElement('div');
            div.classList.add('product-card');

            const card = ` <img class="product-image skeleton image" src="${product.image_url}" alt="product_image">
            <p class="status-sales">Vendas activas: <span class="pc-id">${product.is_active}</span> </p>
            <p>ID: <span class="pc-id">${product.id}</span></p>
            <p class="name" >${product.name}</p>
            <p class="pc-id price">${product.price} MT</p>
            <div class="pc-buttons">
              <button class='edit-product' >Editar</button>
              <button class="delete-product" > Excluir</button>
            </div>
            <button class="pc-links-btn">Links de divulgação</button>`;

            div.innerHTML = card;

            productCard.appendChild(div)


        }

    } else {
        const productCard = document.getproductById('product-grid');
        productCard.innerHTML = '<h1>OPs!! NENHUM PRODUTO ENCONTRADO </h1>';
        pageLoader(false)
    }






}
