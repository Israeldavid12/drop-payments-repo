import { getUserId } from "../user/user_data.mjs";
import { pageLoader } from "../animations/index.js";

export const displayProducts = async () => {
  pageLoader(true);
  const userId = await getUserId();
  const fecth_data = await axios.post('http://127.0.0.1:3013/api/balance', {
    userId: userId,
    reqType: 'fech_user_products',
  });
  const product = fecth_data.data;
  const productCard = document.getElementById('product-grid');
  productCard.innerHTML = '';
  // console.log(product);
  const array = product.produtos;
  
  


  for (let index = 0; index < array.length; index++) {
    const element = array[index];

    const div = document.createElement('div');
    div.classList.add('product-card');

    const card = ` <img class="product-image" src="${element.imageUrl}" alt="product_image">
    <p class="status-sales">Vendas activas</p>
    <p>ID: <span class="pc-id">${element.productId}</span></p>
    <p class="name" >${element.name}</p>
    <p class="pc-id price">${element.price} MT</p>
    <div class="pc-buttons">
      <button class='edit-product' >Editar</button>
      <button> Excluir</button>
    </div>
    <button class="pc-links-btn">Links de divulgação</button>`;

    div.innerHTML = card;

    productCard.appendChild(div)
    div.querySelector('.edit-product').addEventListener('click', () => {
      const productId = div.querySelector('.pc-id').textContent;
      const imageUrl = div.querySelector('.product-image').src;
      const name = div.querySelector('.name').textContent;
      const price = div.querySelector('.price').textContent;

      console.log(productId, imageUrl, name, price)
    });
    console.log(element)

  }

  setTimeout(() => {
    pageLoader(false);
  }, 2500)


}



export function productHub() {
  const container = document.createElement('div');

  fetch(`/app/src/static-pages/product-hub.html`)
    .then((response) => {
      if (!response.ok) throw new Error('Página não encontrada');
      return response.text();
    })
    .then((html) => {

      container.innerHTML = html;
    })
    .catch(() => {
      return '<h1>404 - Página não encontrada</h1>';
    });

  return container;

}