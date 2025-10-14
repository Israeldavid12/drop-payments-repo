(function () {
  // ====== 1. Captura fbclid da URL ======
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  if (!fbclid) return; // nada pra fazer se não existe fbclid

  // ====== 2. Função para adicionar o fbclid a URLs ======
  function addFbclidToUrl(url) {
    try {
      const newUrl = new URL(url, window.location.origin);
      if (!newUrl.searchParams.has('fbclid')) {
        newUrl.searchParams.set('fbclid', fbclid);
      }
      return newUrl.toString();
    } catch (e) {
      return url;
    }
  }

  // ====== 3. Adiciona fbclid a todos os links ======
  document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
      const newHref = addFbclidToUrl(href);
      link.setAttribute('href', newHref);
    });

    // ====== 4. Adiciona fbclid a botões com redirecionamento ======
    const buttons = document.querySelectorAll('button[data-href], button[onclick]');
    buttons.forEach(btn => {
      // Caso 1: botão com atributo data-href
      if (btn.hasAttribute('data-href')) {
        btn.addEventListener('click', function () {
          const href = btn.getAttribute('data-href');
          if (href) window.location.href = addFbclidToUrl(href);
        });
      }

      // Caso 2: botão com onclick que redireciona manualmente
      else if (btn.hasAttribute('onclick')) {
        const onClickCode = btn.getAttribute('onclick');
        if (onClickCode.includes('location') || onClickCode.includes('window.location')) {
          btn.addEventListener('click', function (e) {
            e.preventDefault();
            try {
              // Extrai a URL do código onclick (ex: window.location='checkout.html')
              const match = onClickCode.match(/['"]([^'"]+)['"]/);
              const dest = match ? match[1] : null;
              if (dest) {
                window.location.href = addFbclidToUrl(dest);
              } else {
                eval(onClickCode); // fallback
              }
            } catch (err) {
              console.warn('Erro ao processar botão com onclick:', err);
              eval(onClickCode); // fallback
            }
          });
        }
      }
    });
  });
})();
