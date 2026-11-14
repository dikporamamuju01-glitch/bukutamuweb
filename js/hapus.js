// Menu "Hapus Data Kunjungan" (pimpinan & super admin): filter tanggal/cari, pilih banyak baris, hapus dengan konfirmasi ketik HAPUS.
(function () {
  const v = document.getElementById('v'), sel = new Set();
  const st = document.createElement('style');
  st.textContent = '.hf{display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin:16px 0}.hf>div{flex:1;min-width:150px}.hc{width:auto!important;height:auto!important}';
  document.head.append(st);

  P.hapus = () => {
    if (!S) { go('#/login'); return ''; }
    if (S.r !== 'pimpinan' && S.r !== 'superadmin') { go('#/daftar'); return ''; }
    return dash(`<div class="lab">Pengelolaan data</div><h1>Hapus Data Kunjungan</h1>
    <p class="mu" style="margin:8px 0 16px">Data yang dihapus tidak dapat dikembalikan. Disarankan mengekspor ke Excel lebih dulu di menu Daftar Tamu.</p>
    <div class="card"><div class="hf"><div><label>Dari tanggal</label><input type="date" id="hd1"></div><div><label>Sampai tanggal</label><input type="date" id="hd2"></div><div><label>Cari</label><input id="hq" placeholder="Nama, NIP, instansi"></div><button class="btn" id="hr">Reset</button></div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:12px 0"><b id="hn"></b><button class="btn d" id="hb" disabled>Hapus terpilih</button></div>
    <div class="tw"><table><thead><tr><th><input type="checkbox" class="hc" id="ha" aria-label="Pilih semua"></th><th>Tanggal &amp; jam</th><th>Nama</th><th>Instansi</th><th>Tujuan</th></tr></thead><tbody id="ht"></tbody></table></div></div>`, 'hapus');
  };

  const rows = () => { const a = $('#hd1').value, b = $('#hd2').value, q = $('#hq').value.toLowerCase(); return T.filter(x => (!a || x.Tanggal >= a) && (!b || x.Tanggal <= b) && (!q || (x.Nama + x.NIP + x.Instansi).toLowerCase().includes(q))); };
  function draw() {
    const t = $('#ht'); if (!t) return; const all = rows(), r = all.slice(0, 500);
    [...sel].forEach(id => { if (!T.some(x => x.ID === id)) sel.delete(id); });
    t.innerHTML = r.map(x => `<tr><td><input type="checkbox" class="hc" data-id="${esc(x.ID)}" ${sel.has(x.ID) ? 'checked' : ''}></td><td><b>${esc(x.Tanggal)}</b> <small class="cy">${esc(x.Jam)}</small></td><td>${esc(x.Nama)}</td><td>${esc(x.Instansi)}</td><td>${esc(x.Tujuan)}</td></tr>`).join('') || '<tr><td colspan="5" class="mu">Tidak ada data pada filter ini.</td></tr>';
    $('#hn').textContent = `${all.length} data${all.length > 500 ? ' (ditampilkan 500 pertama, persempit filter)' : ''} · ${sel.size} dipilih`;
    $('#hb').disabled = !sel.size; $('#hb').textContent = 'Hapus terpilih' + (sel.size ? ` (${sel.size})` : '');
    $('#ha').checked = r.length > 0 && r.every(x => sel.has(x.ID));
  }

  function run() {
    const asd = v.querySelector('.dsh aside');
    if (asd && S && (S.r === 'pimpinan' || S.r === 'superadmin')) {
      let a = asd.querySelector('a[href="#/hapus"]');
      if (!a) { a = document.createElement('a'); a.href = '#/hapus'; a.textContent = 'Hapus Data Kunjungan'; asd.querySelector('.usr').before(a); }
      a.classList.toggle('on', location.hash === '#/hapus');
    }
    const t = v.querySelector('#ht'); if (t && !t.dataset.d) { t.dataset.d = 1; sel.clear(); draw(); muatTamu().then(draw); }
  }
  new MutationObserver(run).observe(v, { childList: true, subtree: true }); run();

  document.addEventListener('change', e => {
    const c = e.target;
    if (c.id === 'ha') { rows().slice(0, 500).forEach(x => c.checked ? sel.add(x.ID) : sel.delete(x.ID)); draw(); }
    else if (c.dataset && c.dataset.id && c.closest('#ht')) { c.checked ? sel.add(c.dataset.id) : sel.delete(c.dataset.id); draw(); }
  });
  document.addEventListener('input', e => { if (e.target.closest('.hf')) draw(); });
  document.addEventListener('click', async e => {
    if (e.target.id === 'hr') { ['hd1', 'hd2', 'hq'].forEach(i => $('#' + i).value = ''); draw(); }
    if (e.target.id === 'hb') {
      const n = sel.size; if (!n) return;
      if (prompt(`Anda akan menghapus ${n} data kunjungan secara PERMANEN.\nKetik HAPUS lalu OK untuk melanjutkan:`) !== 'HAPUS') { toast('Dibatalkan.', 1); return; }
      const b = e.target, ids = [...sel]; b.disabled = true; b.textContent = 'Menghapus...';
      const r = await api('tamu.hapusbanyak', { ids });
      if (r.ok) { T = T.filter(x => !ids.includes(x.ID)); LS('btd_t', T); sel.clear(); }
      toast(r.msg, !r.ok); draw();
    }
  });
})();
