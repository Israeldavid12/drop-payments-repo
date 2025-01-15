export function casaPage() {
  const container = document.createElement('div');


  fetch(`/afiliates/inicio.html`)
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




  //container.innerHTML = templatePage;

  return container;


}