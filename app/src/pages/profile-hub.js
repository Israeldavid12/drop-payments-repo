export async function profilePage() {
  const container = document.createElement('div');

  try {
    const data = await axios.get('/app/src/static-pages/profile-hub.html');
    container.innerHTML = data.data;
    return container;

  } catch (error) {

    return '<h1>404 - Página não encontrada</h1>';
  }


}