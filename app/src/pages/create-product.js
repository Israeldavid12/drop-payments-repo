export async function createProduct() {
    const container = document.createElement('div');
  
    try {
      const data = await axios.get('src/static-pages/create-product.html');
      container.innerHTML = data.data;
      return container;
  
    } catch (error) {
  
      return '<h1>404 - Página não encontrada</h1>';
    }
  
  
  }