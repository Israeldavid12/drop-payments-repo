export async function settingsPage() {
    const container = document.createElement('div');

    try {
      const data = await axios.get('src/static-pages/checkout-settings-hub.html');
      container.innerHTML = data.data;
      return container;
  
    } catch (error) {
      console.log(console.error);
      return '<h1>404 - Página não encontrada</h1>';
    }
}