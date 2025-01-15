export default function createProduct()  {
    const container = document.createElement('div');

    fetch(`/afiliates/product.html`)
    .then((response) => {
      if (!response.ok) throw new Error('Página não encontrada');
      return response.text();
    })
    .then((html) => {
      container.innerHTML = html;
    })
    .catch(() => {
      container.innerHTML = '<h1>404 - Página não encontrada</h1>';
    });


    return container;


}