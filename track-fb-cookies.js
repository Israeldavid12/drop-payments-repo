(function () {
  // ========== CONFIG ==========
  // Se true: só anexa fbclid em URLs do mesmo domínio. Se false: anexa em qualquer URL http(s).
  const ONLY_SAME_ORIGIN = false;

  // Nome do parâmetro
  const FB_PARAM = 'fbclid';

  // ========== CAPTURA E ARMAZENAMENTO ==========
  const urlParams = new URLSearchParams(window.location.search);
  const fbclidFromUrl = urlParams.get(FB_PARAM);

  // Tentativa de persistir: localStorage (se disponível), senão memória
  const STORAGE_KEY = '__fbclid_keep';
  let memoryFbclid = null;

  function saveFbclid(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      memoryFbclid = value;
    }
  }
  function readFbclid() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v || memoryFbclid;
    } catch (e) {
      return memoryFbclid;
    }
  }
  if (fbclidFromUrl) saveFbclid(fbclidFromUrl);

  const fbclid = readFbclid();
  if (!fbclid) {
    // nada pra fazer se não houver fbclid em todo o fluxo
    return;
  }

  // ========== HELPERS ==========
  function isHttpUrl(u) {
    try {
      const x = new URL(u, window.location.href);
      return x.protocol === 'http:' || x.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  function isSameOrigin(u) {
    try {
      const x = new URL(u, window.location.href);
      return x.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }

  function addFbclidToUrl(url) {
    try {
      // Para URLs relativas, baseia-se em window.location
      const newUrl = new URL(url, window.location.href);

      // Se configurado para só mesma origem, respeita isso
      if (ONLY_SAME_ORIGIN && newUrl.origin !== window.location.origin) return url;

      if (!newUrl.searchParams.has(FB_PARAM)) {
        newUrl.searchParams.set(FB_PARAM, fbclid);
      }
      return newUrl.toString();
    } catch (e) {
      return url; // se deu erro (ex: url inválida), retorna original
    }
  }

  // Adiciona fbclid em forma segura para href de anchors (sem quebrar fragments)
  function safeSetHref(el, href) {
    try {
      el.setAttribute('href', href);
    } catch (e) {
      // fallback: nada
    }
  }

  // ========== INTERCEPTA CLIQUES (links, botões e elementos com onclick) ==========
  document.addEventListener('click', function (ev) {
    // encontra o elemento clicado e o <a> mais próximo
    let el = ev.target;
    // procura por <a> primeiro (prioridade)
    const anchor = el.closest && el.closest('a[href]');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (!href) return;
      const lower = href.toLowerCase();
      if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:') || href === '#') return;

      // se é http/https ou relativo, processa
      if (isHttpUrl(href)) {
        // se já tem o param, não mexer
        if (!new URL(href, window.location.href).searchParams.has(FB_PARAM)) {
          const newHref = addFbclidToUrl(href);
          // Se target _blank ou com modificadores, atualiza href e deixa o browser abrir normalmente
          const isBlank = anchor.target && anchor.target.toLowerCase() === '_blank';
          const isModified = ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey;

          if (!isBlank && !isModified) {
            // previne o comportamento padrão e redireciona com o param
            ev.preventDefault();
            window.location.href = newHref;
          } else {
            // atualiza href para que a nova aba abra com param
            safeSetHref(anchor, newHref);
            // deixar o evento prosseguir
          }
        }
      }
      return;
    }

    // se não houver anchor, procura botão ou elemento com data-href / onclick que possa redirecionar
    el = ev.target;
    const actionable = el.closest && el.closest('[data-href], button, [onclick]');
    if (!actionable) return;

    // Ignore cases where user used modifiers (wants new tab etc.)
    const isModified = ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey;
    if (isModified) return;

    // Caso: elemento com data-href
    const dataHref = actionable.getAttribute && actionable.getAttribute('data-href');
    if (dataHref) {
      ev.preventDefault();
      const dest = addFbclidToUrl(dataHref);
      window.location.href = dest;
      return;
    }

    // Caso: botão com form associated (type=submit) -> deixa o submit handler tratar
    if (actionable.tagName === 'BUTTON' && actionable.type && actionable.type.toLowerCase() === 'submit') {
      // não interferir aqui; submit será interceptado por 'submit' listener
      return;
    }

    // Caso: onclick inline (atributo)
    const onclickCode = actionable.getAttribute && actionable.getAttribute('onclick');
    if (onclickCode && /location|window\.location|open\(|assign\(|replace\(/i.test(onclickCode)) {
      // Tentamos extrair URL simples entre aspas
      ev.preventDefault();
      const m = onclickCode.match(/['"]([^'"]+)['"]/);
      if (m && m[1]) {
        const dest = addFbclidToUrl(m[1]);
        window.location.href = dest;
        return;
      }
      // fallback: avalia o onclick (pior caso)
      try {
        // substitui possíveis occurrences de "location.href='...'" etc. adicionando fbclid
        const patched = onclickCode.replace(/(location(?:\.href)?\s*=\s*['"])([^'"]+)(['"])/gi, function (_, p1, p2, p3) {
          return p1 + addFbclidToUrl(p2) + p3;
        }).replace(/(window\.open\s*\(\s*['"])([^'"]+)(['"])/gi, function (_, p1, p2, p3) {
          return p1 + addFbclidToUrl(p2) + p3;
        });
        // Executa o código (com patch). Se falhar, deixa o onclick original rodar.
        eval(patched);
      } catch (e) {
        try { eval(onclickCode); } catch (_) {}
      }
      return;
    }

    // Caso geral: não é anchor nem data-href nem onclick com url -> não interferir
  }, true); // capture = true para interceptar antes de handlers inline

  // ========== INTERCEPTA SUBMITS (forms) ==========
  document.addEventListener('submit', function (ev) {
    const form = ev.target;
    if (!form || !form.getAttribute) return;
    const action = form.getAttribute('action') || window.location.href; // action vazio submete para a mesma página
    // se action é http(s) ou relativo, anexa fbclid
    if (!isHttpUrl(action)) return;

    // Se a action já tem fbclid, não faz nada
    try {
      const actionUrl = new URL(action, window.location.href);
      if (!actionUrl.searchParams.has(FB_PARAM)) {
        // tenta adicionar hidden input antes do submit (não impede submit)
        let hidden = form.querySelector('input[name="' + FB_PARAM + '"]');
        if (!hidden) {
          hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = FB_PARAM;
          form.appendChild(hidden);
        }
        hidden.value = fbclid;
        // Também atualiza o action pra incluir no caso de submissão GET
        if ((form.method || '').toLowerCase() === 'get') {
          form.setAttribute('action', addFbclidToUrl(action));
        }
      }
    } catch (e) { /* ignore */ }
  }, true);

  // ========== MONKEY-PATCH PROGRAMMATIC NAVIGATION ==========
  // assign / replace
  const origAssign = window.location.assign.bind(window.location);
  const origReplace = window.location.replace.bind(window.location);

  window.location.assign = function (url) {
    try {
      origAssign(addFbclidToUrl(url));
    } catch (e) {
      origAssign(url);
    }
  };

  window.location.replace = function (url) {
    try {
      origReplace(addFbclidToUrl(url));
    } catch (e) {
      origReplace(url);
    }
  };

  // override href setter if possible (nem todos os navegadores permitem)
  try {
    const loc = window.location;
    let currentHref = loc.href;
    Object.defineProperty(window.location, 'href', {
      configurable: true,
      enumerable: true,
      get: function () { return currentHref; },
      set: function (val) {
        try {
          currentHref = addFbclidToUrl(val);
          origAssign(currentHref);
        } catch (e) {
          currentHref = val;
          origAssign(val);
        }
      }
    });
  } catch (e) {
    // pode falhar em alguns browsers; ok
  }

  // window.open
  const origOpen = window.open.bind(window);
  window.open = function (url, name, specs) {
    try {
      return origOpen(addFbclidToUrl(url), name, specs);
    } catch (e) {
      return origOpen(url, name, specs);
    }
  };

  // ========== INTERCEPTA HISTORY (SPA) ==========
  const origPush = history.pushState;
  const origReplaceState = history.replaceState;

  history.pushState = function (state, title, url) {
    try {
      if (typeof url === 'string') {
        const newUrl = addFbclidToUrl(url);
        return origPush.call(history, state, title, newUrl);
      } else {
        return origPush.call(history, state, title, url);
      }
    } catch (e) {
      return origPush.call(history, state, title, url);
    }
  };

  history.replaceState = function (state, title, url) {
    try {
      if (typeof url === 'string') {
        const newUrl = addFbclidToUrl(url);
        return origReplaceState.call(history, state, title, newUrl);
      } else {
        return origReplaceState.call(history, state, title, url);
      }
    } catch (e) {
      return origReplaceState.call(history, state, title, url);
    }
  };

  // ========== OBSERVA MUTAÇÕES (elementos dinâmicos) ==========
  const observer = new MutationObserver(function (mutations) {
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes && m.addedNodes.length) {
        m.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          // atualiza anchors dentro do novo nó
          const anchors = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
          anchors.forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
            if (!new URL(href, window.location.href).searchParams.has(FB_PARAM)) {
              const newHref = addFbclidToUrl(href);
              safeSetHref(a, newHref);
            }
          });
          // atualiza elements com data-href
          const dataEls = node.querySelectorAll ? node.querySelectorAll('[data-href]') : [];
          dataEls.forEach(el => {
            const dh = el.getAttribute('data-href');
            if (!dh) return;
            if (!new URL(dh, window.location.href).searchParams.has(FB_PARAM)) {
              el.setAttribute('data-href', addFbclidToUrl(dh));
            }
          });
          // forms: se forem adicionados com action, atualiza (para GET)
          const forms = node.querySelectorAll ? node.querySelectorAll('form[action]') : [];
          forms.forEach(f => {
            const action = f.getAttribute('action');
            if (!action) return;
            if (!new URL(action, window.location.href).searchParams.has(FB_PARAM)) {
              // só muda a action; submit listener adiciona hidden para POSTs
              f.setAttribute('action', addFbclidToUrl(action));
            }
          });
        });
      }
    }
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });

  // ========== LOG ==========
  try { console.log('[fbclid-propagator] ativo — fbclid:', fbclid); } catch (e) {}

})();
