/* Keep the originating main-deck page with each appendix visit. */
(() => {
  const key = 'zhonghong-main-return-v1';
  const isReference = /\/references(?:-mobile)?\.html$/.test(location.pathname);
  const isMobile = /\/mobile\.html$/.test(location.pathname);
  const validPage = value => /^\d+$/.test(String(value)) && +value >= 1 && +value <= 28;
  const readSaved = () => {
    try { return JSON.parse(sessionStorage.getItem(key) || 'null'); }
    catch (_) { return null; }
  };
  if (isReference) {
    const query = new URLSearchParams(location.search);
    const saved = readSaved();
    const page = validPage(query.get('returnPage')) ? +query.get('returnPage')
      : validPage(saved?.page) ? +saved.page : 1;
    const view = query.has('returnPage') ? query.get('returnView') : saved?.view;
    const target = new URL(view === 'mobile' ? 'mobile.html' : 'index.html', location.href);
    target.hash = page;
    if (view === 'desktop') target.searchParams.set('view', 'desktop');
    const version = query.get('v');
    if (version) target.searchParams.set('v', version);
    for (const link of document.querySelectorAll('a[href]')) {
      if (link.textContent.includes('返回主讲')) link.href = target.href;
    }
    return;
  }
  const decorate = () => {
    const page = validPage(location.hash.slice(1)) ? +location.hash.slice(1) : 1;
    const view = isMobile ? 'mobile' : 'desktop';
    try { sessionStorage.setItem(key, JSON.stringify({page, view})); } catch (_) {}
    for (const link of document.querySelectorAll('a[href]')) {
      const target = new URL(link.getAttribute('href'), location.href);
      if (target.origin !== location.origin || !/\/references(?:-mobile)?\.html$/.test(target.pathname)) continue;
      target.searchParams.set('returnPage', page);
      target.searchParams.set('returnView', view);
      const version = new URLSearchParams(location.search).get('v');
      if (version) target.searchParams.set('v', version);
      if (link.href !== target.href) link.href = target.href;
    }
  };
  decorate();
  addEventListener('hashchange', decorate);
  // Desktop changes the hash with replaceState; mobile creates links after iframe load.
  for (const event of ['pointerdown', 'click', 'auxclick', 'focusin']) {
    document.addEventListener(event, decorate, true);
  }
  new MutationObserver(decorate).observe(document.body, {childList:true, subtree:true});
})();
