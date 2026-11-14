// Ukuran bingkai foto (potret/lanskap/persegi), menu pengaturannya, dan Video Kegiatan di Galeri.
(function () {
  const v = document.getElementById('v');
  const AR = { potret: '4/5', lanskap: '16/9', persegi: '1/1' }, DEF = { pimpinan: 'lanskap', staf: 'persegi', kegiatan: 'lanskap' };
  const LBL = { 'Jajaran Pimpinan': 'pimpinan', 'Staf Kantor': 'staf' };
  const st = document.createElement('style');
  st.textContent = '.grid[data-ar] .ph img{aspect-ratio:var(--ar)}.vp{position:relative;cursor:pointer}.vp:after{content:"▶";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(59,130,246,.9);display:grid;place-items:center;font-size:24px;padding-left:4px;box-shadow:0 0 20px rgba(59,130,246,.5);pointer-events:none}#pl{position:fixed;inset:0;background:rgba(0,0,0,.88);display:none;place-items:center;z-index:90}#pl.on{display:grid}#pl .bx{width:min(1000px,94vw);aspect-ratio:16/9}#pl iframe,#pl video{width:100%;height:100%;border:0;border-radius:12px;background:#000}#pl .x{position:absolute;top:16px;right:16px}body.pg-isi{background-image:var(--bgi)!important;background-size:cover!important;background-attachment:fixed!important}body.pg-isi .card{background:rgba(21,29,46,.82);backdrop-filter:blur(8px)}body.pg-isi .two{grid-template-columns:1.3fr 1fr}#ok{min-height:460px;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:36px}#ok h2{font-size:30px}#ok p{font-size:18px}.vf{grid-column:1/-1;max-width:980px;width:100%;margin:0 auto}.vfb{aspect-ratio:16/9;width:100%}.vfb iframe,.vfb video{width:100%;height:100%;border:0;border-radius:12px;background:#000}@media(max-width:900px){body.pg-isi .two{grid-template-columns:1fr}}';
  document.head.append(st);

  // ---- Bingkai per bagian ----
  function apply(g, j) {
    const k = (B.set || {})['bingkai_' + j] || DEF[j], a = AR[k]; if (!a) return;
    g.dataset.ar = 1; g.style.setProperty('--ar', a); g.style.gridTemplateColumns = k === 'potret' ? 'repeat(auto-fill,minmax(260px,1fr))' : '';
  }
  function frames() {
    v.querySelectorAll('.lab + .grid').forEach(g => { const j = LBL[g.previousElementSibling.textContent.trim()]; if (j) apply(g, j); });
    if (location.hash === '#/galeri') v.querySelectorAll('.grid:not(#vg)').forEach(g => apply(g, 'kegiatan'));
  }

  // ---- Video ----
  const yt = u => { const m = String(u).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); return m && m[1]; };
  const dr = u => { const m = String(u).match(/\/d\/([\w-]{20,})|[?&]id=([\w-]{20,})/); return m && (m[1] || m[2]); };
  const cover = u => yt(u) ? `https://img.youtube.com/vi/${yt(u)}/hqdefault.jpg` : dr(u) ? `https://drive.google.com/thumbnail?id=${dr(u)}&sz=w1000` : '';
  const pl = document.createElement('div'); pl.id = 'pl'; pl.innerHTML = '<button class="btn x" aria-label="Tutup">✕ Tutup</button><div class="bx"></div>'; document.body.append(pl);
  const stop = () => { pl.classList.remove('on'); pl.querySelector('.bx').innerHTML = ''; };
  pl.onclick = e => { if (e.target === pl || e.target.closest('.x')) stop(); };
  addEventListener('keydown', e => { if (e.key === 'Escape') stop(); });
  window.playVid = id => {
    const x = B.foto.find(f => f.ID === id); if (!x) return; let h; const y = yt(x.Url), d = dr(x.Url);
    if (y) h = `<iframe src="https://www.youtube.com/embed/${y}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    else if (d) h = `<iframe src="https://drive.google.com/file/d/${d}/preview" allow="autoplay" allowfullscreen></iframe>`;
    else if (/\.(mp4|webm)(\?|$)/i.test(x.Url)) h = `<video src="${esc(x.Url)}" controls autoplay></video>`;
    else { window.open(x.Url, '_blank', 'noopener'); return; }
    pl.querySelector('.bx').innerHTML = h; pl.classList.add('on');
  };
  function vids() {
    if (location.hash !== '#/galeri') return; const pg = v.querySelector('main.pg'); if (!pg || pg.querySelector('#vg')) return;
    const vs = B.foto.filter(x => x.Jenis === 'video'); if (!vs.length) return;
    const s = document.createElement('div');
    s.innerHTML = `<h2 style="margin-top:32px">Video Kegiatan</h2><div class="grid" id="vg">${vs.map(x => `<div class="card ph"><div class="vp" onclick="playVid('${esc(x.ID)}')"><img loading="lazy" src="${esc(cover(x.Url))}" alt=""></div><b>${esc(x.Nama)}</b><small>${esc(x.Keterangan)}</small></div>`).join('')}</div>`;
    pg.append(s);
  }

  // ---- Halaman Pengisian: background + bingkai video ----
  const emb = u => {
    const y = yt(u), d = dr(u);
    if (y) return `<iframe src="https://www.youtube.com/embed/${y}?rel=0" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    if (d) return `<iframe src="https://drive.google.com/file/d/${d}/preview" allowfullscreen></iframe>`;
    if (/\.(mp4|webm)(\?|$)/i.test(u)) return `<video src="${esc(u)}" controls></video>`; return '';
  };
  function isi() {
    const on = location.hash === '#/isi'; document.body.classList.toggle('pg-isi', on); if (!on) return;
    const bg = (B.set || {}).bg;
    document.body.style.setProperty('--bgi', bg ? `linear-gradient(rgba(11,15,25,.5),rgba(11,15,25,.78)),url(${drv(bg)})` : 'radial-gradient(circle at 15% 10%,rgba(59,130,246,.28),transparent 50%),radial-gradient(circle at 85% 85%,rgba(34,211,238,.2),transparent 45%),linear-gradient(#0B0F19,#0B0F19)');
    const two = v.querySelector('.two'); if (!two || two.querySelector('.vf')) return;
    const x = B.foto.find(f => f.Jenis === 'video-form'), h = x && emb(x.Url);
    if (!h && !(S && S.r === 'superadmin')) return;
    const c = document.createElement('div'); c.className = 'card vf';
    c.innerHTML = `<h2>${esc(x ? x.Nama : 'Video Panduan')}</h2>` + (h ? `<div class="vfb">${h}</div><small class="mu">${esc(x.Keterangan)}</small>` : '<p class="mu">Belum ada video. Tambahkan lewat Pengaturan → Foto Beranda & Galeri: pilih Jenis "video-form", lalu tempel link YouTube atau Google Drive. (Pesan ini hanya terlihat oleh super admin.)</p>');
    two.append(c);
  }

  // ---- Menu Pengaturan: ukuran bingkai + jenis "video" ----
  function pengaturan() {
    const ff = v.querySelector('#ff'); if (!ff || v.querySelector('#fb')) return;
    const sel = j => `<div><label>Bingkai ${j}</label><select name="bingkai_${j}">${[['potret', 'Potret (4:5)'], ['lanskap', 'Lanskap (16:9)'], ['persegi', 'Persegi (1:1)']].map(([k, n]) => `<option value="${k}" ${((B.set || {})['bingkai_' + j] || DEF[j]) === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>`;
    const f = document.createElement('form'); f.id = 'fb'; f.className = 'card'; f.style.marginBottom = '20px';
    f.innerHTML = `<h2>Ukuran Bingkai Foto</h2><div class="row">${sel('pimpinan')}${sel('staf')}${sel('kegiatan')}</div><button class="btn p">Simpan Bingkai</button><small class="mu" style="display:block;margin-top:8px">Berlaku di Beranda dan Galeri, serta menjadi rasio pemotong untuk foto baru.</small>`;
    ff.before(f);
    f.addEventListener('submit', async e => {
      e.preventDefault(); e.stopPropagation(); const b = e.submitter; b.disabled = true;
      const r = await api('set.simpan', Object.fromEntries(new FormData(f))); b.disabled = false; toast(r.msg, !r.ok); if (r.ok) await segarBoot();
    });
    const jn = ff.querySelector('[name=Jenis]'), u = ff.querySelector('[name=Url]');
    if (jn && ![...jn.options].some(o => o.value === 'video')) { jn.add(new Option('video', 'video')); jn.add(new Option('video-form', 'video-form')); }
    if (jn && u) jn.addEventListener('change', () => { u.placeholder = jn.value.indexOf('video') === 0 ? 'Tempel link YouTube atau Google Drive video' : 'Atau tempel URL foto (opsional)'; });
  }

  const run = () => { frames(); vids(); pengaturan(); isi(); };
  new MutationObserver(run).observe(v, { childList: true, subtree: true }); run();
})();
