import { getUserId } from "../user/user_data.mjs";
import { pageLoader, showAnPopup } from "../animations/index.js";

export const displayProducts = async () => {
  pageLoader(true);
  const userId = await getUserId();
  const fecth_data = await axios.post('https://www.dropaymentsmz.online/api/v2/live/server', {
    userId: userId,
    reqType: 'fech_user_products',
  });

  console.log(fecth_data)

  if (fecth_data.data.code) {
    if (fecth_data.data.code === '404') {
      console.log('console')
      const productCard = document.getElementById('product-grid');
      productCard.innerHTML = '';
      const div = document.createElement('div');
      const template = `<h1>OPs!! NENHUM PRODUTO ENCONTRADO <h1>`;
      div.innerHTML = template;
      productCard.appendChild(div);
      setTimeout(() => {
        pageLoader(false);
      }, 2500)
      return;
    }
  }

  try {

    const product = fecth_data.data;
    const productCard = document.getElementById('product-grid');
    productCard.innerHTML = '';

    const array = product.produtos.reverse();




    for (let index = 0; index < array.length; index++) {
      const element = array[index];

      const div = document.createElement('div');
      div.classList.add('product-card');

      const card = ` <img class="product-image skeleton image" src="${element.imageUrl}" alt="product_image">
      <p class="status-sales">Vendas activas</p>
      <p>ID: <span class="pc-id">${element.productId}</span></p>
      <p class="name" >${element.name}</p>
      <p class="pc-id price">${element.price} MT</p>
      <div class="pc-buttons">
        <button class='edit-product' >Editar</button>
        <button class="delete-product" > Excluir</button>
      </div>
      <button class="pc-links-btn">Links de divulgação</button>`;

      div.innerHTML = card;

      productCard.appendChild(div)


      //DISPLAY EDIT POPUP PRODUCT
      div.querySelector('.edit-product').addEventListener('click', () => {
        const imageUrl = div.querySelector('.product-image').src;
        const name = div.querySelector('.name').textContent;
        const id = div.querySelector('.pc-id').textContent;
        const price = Number(element.price);

        const template = ` <div class="pop-edit-product">
                  <div class="pop-edit-header">
                      <p>Editar informacoes do produto</p>
                  </div>
                   <p>ID : <span class="product-id" >${id}</span></p>
                  <p>Imagem do produto</p>
                  <input id="new-image" class="new-image" type="file" accept="image/*" >
                  <img class="image-url" src="${imageUrl}" alt="product image">
                  <p>Nome do produto</p>
                  <input class="p-name" type="text" value="${name}" >
                  <p>Preço do produto</p>
                  <input class="price" type="number" value="${price}">
                  <button id="save-edit" class="save-edit" >Salvar</button>
                  <button class="cancel-edit" >Cancelar</button>
              </div>`

        showAnPopup(template, true)




      });

      div.querySelector('.delete-product').addEventListener('click', () => {

        const product_id = div.querySelector('.pc-id').textContent;
        const template = ` <div class="grid-delete-product" >
                  <p  class="product-name-delete" >ID: <span class="product-id" >${product_id}</span> </p>
                  <p>Tem certeza que deseja excluir este produto?</p>
                  <div class="flex-delete-product" >
                      <button id="confirm-delete" class="confirm-delete" >Sim</button> <button class="cancel-delete" >Não</button>
                  </div>
              </div>`;

        showAnPopup(template, true)


      })

      div.querySelector('.pc-links-btn').addEventListener('click', () => {
        const product_id = div.querySelector('.pc-id').textContent;


        const template = ` <div class="modal-link" >
                  <i class="bi bi-x-lg"></i>
                  <p>Link de divulgação</p>
                  <div class="modal-content" >
                      <p>Página de pagamento</p>
                       <input class="product-link-page" type="text" value="https://www.dropaymentsmz.online/v2/checkout/?id=${product_id}" >
                       <p class="info-link" >Página que seus compradores preenchem informações, métodos de pagamento e realizam a compra</p>
                       <div class="modal-button" >
                         <i class="bi bi-copy"></i> <i class="bi bi-box-arrow-up-right"></i>
                         
                       </div>
                  </div>   
              </div>`;

        showAnPopup(template, true)
      })

      setTimeout(() => {
        pageLoader(false);
      }, 2500)


    }

  } catch (error) {
    console.log(error)
    const productCard = document.getElementById('product-grid');
    productCard.innerHTML = '';
    const div = document.createElement('div');
    const template = ``;
    div.innerHTML = `<h1>OPs!! NENHUM PRODUTO ENCROTADO <h1>`
    productCard.appendChild(div)

    setTimeout(() => {
      pageLoader(false);
    }, 2500)

  }




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