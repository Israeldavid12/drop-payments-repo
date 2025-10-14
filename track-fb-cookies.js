(function() {
  // Função para adicionar parâmetro x=y à URL
  function addParameterToURL(url, paramName, paramValue) {
    try {
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set(paramName, paramValue);
      return urlObj.toString();
    } catch (e) {
      console.error('Erro ao manipular URL:', e);
      return url;
    }
  }

  // Interceptar cliques em âncoras (<a>)
  document.addEventListener('click', function(event) {
    const anchor = event.target.closest('a');
    if (anchor && anchor.href) {
      event.preventDefault();
      const modifiedURL = addParameterToURL(anchor.href, 'x', 'y');
      console.log('Redirecionando âncora para:', modifiedURL);
      window.location.assign(modifiedURL);
    }
  }, true);

  // Sobrescrever window.location.href
  let lastHref = window.location.href;
  Object.defineProperty(window.location, 'href', {
    set: function(url) {
      const modifiedURL = addParameterToURL(url, 'x', 'y');
      console.log('Alterando href para:', modifiedURL);
      lastHref = modifiedURL;
      window.location = modifiedURL;
    },
    get: function() {
      return lastHref;
    }
  });
})();
