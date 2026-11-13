// Menu navigasi publik sebagai panel samping kiri (popup). Tidak mengubah app.js.
(function () {
  const v = document.getElementById('v'), d = document.createElement('aside'), m = document.createElement('div');
  d.id = 'dr'; m.id = 'dm'; document.body.append(d, m);
  const close = () => document.body.classList.remove('dro');
  m.onclick = close; d.onclick = e => { if (e.target.closest('a,.x')) close(); };
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  addEventListener('hashchange', close);
  function sync() {
    const h = v.querySelector('header.nav'); if (!h) return;
    if (!h.dataset.dr) {
      h.dataset.dr = 1; const b = document.createElement('button');
      b.className = 'hb'; b.setAttribute('aria-label', 'Buka menu'); b.textContent = '☰';
      b.onclick = () => document.body.classList.add('dro'); h.prepend(b);
    }
    const t = (document.title || 'Menu').replace(/[<>&]/g, ''), lg = h.querySelector(':scope>a.btn');
    d.innerHTML = `<div class="dh"><b>${t}</b><button class="x btn" aria-label="Tutup menu">✕</button></div>` +
      [...h.querySelectorAll('nav a')].map(a => a.outerHTML).join('') + (lg ? lg.outerHTML : '');
  }
  new MutationObserver(sync).observe(v, { childList: true, subtree: true }); sync();
})();
