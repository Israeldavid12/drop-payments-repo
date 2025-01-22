export function profilePage() {
    const container = document.createElement('div');
  
    fetch(`/app/src/static-pages/profile-hub.html`)
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