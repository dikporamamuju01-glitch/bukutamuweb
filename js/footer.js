// Footer publik: media sosial, contact center, no. pengaduan, dan kredit pembuat. Isi diatur di js/config.js (FOOTER).
(function () {
  const st = document.createElement('style');
  st.textContent = 'footer.ft{text-align:left;padding:32px;display:grid;gap:28px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}footer.ft h4{font:500 12px Geist,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:var(--cy);margin-bottom:10px}footer.ft p{margin-bottom:6px}footer.ft a.t{font-size:18px;color:var(--tx)}.so{display:inline-block;border:1px solid var(--bd);border-radius:99px;padding:9px 18px;margin:0 8px 8px 0;font-size:16px;color:var(--tx);transition:.15s}.so:hover{border-color:var(--pr);background:rgba(59,130,246,.1)}footer.ft .cr{grid-column:1/-1;border-top:1px solid var(--bd);padding-top:16px;text-align:center}';
  document.head.append(st);
  const e = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tel = n => 'tel:' + String(n).replace(/[^0-9+]/g, '');
  function build(f) {
    f.dataset.ft = 1; f.classList.add('ft'); const c = (window.APP_CONFIG || {}).FOOTER || {};
    const so = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['youtube', 'YouTube']].filter(([k]) => c[k]).map(([k, n]) => `<a class="so" href="${e(c[k])}" target="_blank" rel="noopener">${n}</a>`).join('');
    f.innerHTML = `<div><h4>${e((B.set && B.set.judul) || document.title)}</h4><p class="mu">© 2026 Hak cipta dilindungi.</p></div>
    <div><h4>Hubungi Kami</h4>${c.callcenter ? `<p class="mu">Contact Center<br><a class="t" href="${tel(c.callcenter)}">${e(c.callcenter)}</a></p>` : ''}${c.pengaduan ? `<p class="mu">No. Pengaduan<br><a class="t" href="${tel(c.pengaduan)}">${e(c.pengaduan)}</a></p>` : ''}</div>
    ${so ? `<div><h4>Media Sosial</h4>${so}</div>` : ''}
    <div class="cr">${c.pembuat ? `Pengembang &amp; Pembuat Aplikasi: <b>${e(c.pembuat)}</b> · ` : ''}<a href="#" onclick="return fx()">Suara &amp; kupu-kupu: ${FX ? 'Aktif' : 'Mati'}</a></div>`;
  }
  const sync = () => { const f = document.querySelector('#v footer'); if (f && !f.dataset.ft) build(f); };
  new MutationObserver(sync).observe(document.getElementById('v'), { childList: true, subtree: true }); sync();
})();
