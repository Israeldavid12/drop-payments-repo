<script>
(function () {
  // ---------- Config ----------
  const COOKIE_EXPIRE_DAYS = 90;
  const COOKIE_PATH = '/';
  const COOKIE_FBP = 'fbp';
  const COOKIE_FBC = 'fbc';

  // ---------- Helpers ----------
  function getQueryParam(name, url = window.location.href) {
    name = name.replace(/[[]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  function setCookie(name, value, days = COOKIE_EXPIRE_DAYS, path = COOKIE_PATH) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=${path}`;
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }

  function buildFBP() {
    // formato: fb.1.<timestamp>.<random>
    const ts = Math.floor(Date.now() / 1000);
    const rnd = Math.floor(Math.random() * 1e9);
    return `fb.1.${ts}.${rnd}`;
  }

  function buildFBC(fbclid) {
    const ts = Math.floor(Date.now() / 1000);
    return `fb.1.${ts}.${fbclid}`;
  }

  function hasParam(url, param) {
    const re = new RegExp('[?&]' + param + '(=|&|#|$)');
    return re.test(url);
  }

  function appendParamsToUrl(url, paramsObj) {
    // evita duplicar parâmetros; adiciona apenas os que não existam
    const urlObj = new URL(url, window.location.origin);
    for (const k in paramsObj) {
      if (!paramsObj[k]) continue;
      if (!urlObj.searchParams.has(k)) {
        urlObj.searchParams.set(k, paramsObj[k]);
      }
    }
    return urlObj.toString();
  }

  // ---------- Execução inicial ----------
  // 1) Captura fbclid da URL atual (se existir) e grava cookie fbc
  const fbclid = getQueryParam('fbclid');
  if (fbclid) {
    try {
      const newFbc = buildFBC(fbclid);
      setCookie(COOKIE_FBC, newFbc);
      // opcional: limpa o fbclid da barra de endereço sem recarregar a página
      // (com history.replaceState)
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('fbclid');
        window.history.replaceState({}, document.title, url.toString());
      } catch (e) { /* ignore */ }
    } catch (e) {
      console.error('Erro ao setar cookie fbc:', e);
    }
  }

  // 2) Garante existência de cookie fbp (se não existir, cria)
  let fbp = getCookie(COOKIE_FBP);
  if (!fbp) {
    try {
      fbp = buildFBP();
      setCookie(COOKIE_FBP, fbp);
    } catch (e) {
      console.error('Erro ao setar cookie fbp:', e);
    }
  }

  // 3) Listener global para cliques em links — adiciona fbp e fbc na URL destino
  document.addEventListener('click', function (ev) {
    // encontra o <a> mais próximo
    let el = ev.target;
    while (el && el.tagName !== 'A') {
      el = el.parentElement;
    }
    if (!el) return; // não é clique em link

    const href = el.getAttribute('href');
    if (!href) return;

    // Ignorar links especiais
    const lower = href.toLowerCase();
    if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:') || lower === '#') {
      return;
    }

    // Só processar links com destino HTTP/HTTPS ou relativos
    // Se 'target' for _blank ou com modifiers (Ctrl/Cmd), não impedir default
    const isModified = ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey;
    const targetBlank = el.target && el.target.toLowerCase() === '_blank';

    try {
      const cookieFbp = getCookie(COOKIE_FBP);
      const cookieFbc = getCookie(COOKIE_FBC);
      const params = {};
      if (cookieFbp) params['fbp'] = cookieFbp;
      if (cookieFbc) params['fbc'] = cookieFbc;

      // se não há parâmetros para anexar, nada a fazer
      if (!Object.keys(params).length) return;

      // Construir URL absoluta baseada na página
      const destUrl = new URL(href, window.location.href);
      // Se a URL já contém fbp/fbc, não sobrescrever
      let needAppend = false;
      for (const k in params) {
        if (!destUrl.searchParams.has(k)) needAppend = true;
      }
      if (!needAppend) return;

      const newUrl = appendParamsToUrl(destUrl.toString(), params);

      // Se for clique normal (sem modifiers e não target _blank), previne e redireciona
      if (!isModified && !targetBlank) {
        ev.preventDefault();
        window.location.href = newUrl;
      } else {
        // Para _blank ou com modifiers, atualiza href para que o browser abra com params
        el.setAttribute('href', newUrl);
        // permitir comportamento padrão (abrir em nova aba)
      }
    } catch (err) {
      console.error('Erro ao anexar fbp/fbc ao link:', err);
      // se falhar, não impedir o clique
    }
  }, true);
})();
</script>
