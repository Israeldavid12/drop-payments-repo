import { getUserId } from "../user/user_data.mjs";

export const displayProducts = async () => {
  const userId = await getUserId();
  const fecth_data = await axios.post('http://127.0.0.1:3010/api/balance', {
    userId: userId,
    reqType: 'fech_user_products',
  });
  const productCard = document.getElementById('product-card');
  productCard.innerHTML = '';
  console.log(fecth_data.data);

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