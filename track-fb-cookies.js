(function() {
  // Função para extrair parâmetro da URL
  function getUrlParameter(url, paramName) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.searchParams.get(paramName);
    } catch (e) {
      console.error('Erro ao extrair parâmetro:', e);
      const match = url.match(new RegExp('[?&]' + paramName + '=([^&]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    }
  }

  // Função para adicionar parâmetro à URL
  function addParameterToURL(url, paramName, paramValue) {
    if (!paramValue) return url; // Não adiciona se não houver valor
    try {
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set(paramName, paramValue);
      return urlObj.toString();
    } catch (e) {
      console.error('Erro ao adicionar parâmetro:', e);
      return url + (url.includes('?') ? '&' : '?') + paramName + '=' + paramValue;
    }
  }

  // Captura e armazena fbclid na carga da página
  function captureFbclid() {
    const fbclid = getUrlParameter(window.location.href, 'fbclid');
    if (fbclid) {
      sessionStorage.setItem('fbclid', fbclid);
      console.log('fbclid capturado e armazenado:', fbclid);
      // Opcional: limpar fbclid da URL atual
      const cleanUrl = window.location.href.replace(new RegExp('[?&]fbclid=[^&]*'), '').replace(/\?$/g, '');
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  // Recupera fbclid armazenado
  function getStoredFbclid() {
    return sessionStorage.getItem('fbclid');
  }

  // Executa captura imediatamente
  captureFbclid();

  // Interceptar cliques em âncoras (<a>)
  document.addEventListener('click', function(event) {
    const anchor = event.target.closest('a');
    if (anchor && anchor.href) { // Ignora links com target="_blank"
      event.preventDefault();
      const fbclid = getStoredFbclid();
      const modifiedURL = addParameterToURL(anchor.href, 'fbclid', fbclid);
      console.log('Redirecionando âncora com fbclid:', modifiedURL);
      window.location.assign(modifiedURL);
    }
  }, true);

  // Sobrescrever window.location.assign
  const originalAssign = window.location.assign;
  window.location.assign = function(url) {
    const fbclid = getStoredFbclid();
    const modifiedURL = addParameterToURL(url, 'fbclid', fbclid);
    console.log('Redirecionando via assign com fbclid:', modifiedURL);
    return originalAssign.call(window.location, modifiedURL);
  };

  // Sobrescrever window.location.replace
  const originalReplace = window.location.replace;
  window.location.replace = function(url) {
    const fbclid = getStoredFbclid();
    const modifiedURL = addParameterToURL(url, 'fbclid', fbclid);
    console.log('Substituindo via replace com fbclid:', modifiedURL);
    return originalReplace.call(window.location, modifiedURL);
  };
})();
