// Pengaturan: Edit data foto (pimpinan/staf/dll) + Daftar Akun (edit, nonaktifkan, hapus).
(function () {
  const v = document.getElementById('v'), JN = ['pimpinan', 'staf', 'kegiatan', 'video', 'video-form'];
  let AK = [];

  // ---- Edit data foto: tautan "Edit" di samping "Hapus" ----
  function fotoLinks() {
    v.querySelectorAll('#ff .ph small a[onclick*="hpsFoto"]').forEach(a => {
      if (a.dataset.ed) return; a.dataset.ed = 1;
      const id = (a.getAttribute('onclick').match(/hpsFoto\('([^']+)'/) || [])[1]; if (!id) return;
      const e = document.createElement('a'); e.href = '#'; e.className = 'cy'; e.dataset.edit = id; e.textContent = 'Edit'; a.before(e, ' · ');
    });
  }
  function editFoto(id) {
    const x = B.foto.find(f => f.ID === id); if (!x) return;
    const m = document.createElement('div'); m.className = 'mod';
    m.innerHTML = `<form class="card"><h2>Edit Data</h2>
      <div class="row"><div><label>Nama</label><input name="Nama" required value="${esc(x.Nama)}"></div><div><label>Keterangan / Jabatan</label><input name="Keterangan" value="${esc(x.Keterangan)}"></div></div>
      <div class="row"><div><label>Jenis</label><select name="Jenis">${JN.map(j => `<option ${x.Jenis === j ? 'selected' : ''}>${j}</option>`).join('')}</select></div><div><label>Ganti URL foto/video (kosongkan jika tetap)</label><input name="Url" placeholder="https://..."></div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn" data-x>Batal</button><button class="btn p">Simpan</button></div></form>`;
    document.body.append(m); m.querySelector('[data-x]').onclick = () => m.remove();
    m.querySelector('form').onsubmit = async ev => {
      ev.preventDefault(); ev.stopPropagation(); const b = ev.submitter; b.disabled = true;
      const r = await api('foto.ubah', { ...Object.fromEntries(new FormData(ev.target)), ID: id }); b.disabled = false; toast(r.msg, !r.ok);
      if (r.ok) { m.remove(); await segarBoot(); render(); }
    };
  }

  // ---- Akun: daftar + form edit ----
  async function akunMuat() { const r = await api('akun.list'); if (r.ok) { AK = r.rows; akunGambar(); } }
  function akunGambar() {
    const t = v.querySelector('#at'); if (!t) return;
    t.innerHTML = AK.map(x => `<tr><td>${esc(x.Username)}</td><td>${esc(x.Nama)}</td><td><span class="chip">${esc(x.Role)}</span></td><td>${x.Aktif === 'Y' ? 'Aktif' : '<span style="color:var(--er)">Nonaktif</span>'}</td><td><button class="btn" data-ae="${esc(x.Username)}">Edit</button> <button class="btn d" data-ah="${esc(x.Username)}">Hapus</button></td></tr>`).join('') || '<tr><td colspan="5" class="mu">Belum ada akun.</td></tr>';
  }
  function akun() {
    const fa = v.querySelector('#fa'); if (!fa || fa.dataset.ak) return; fa.dataset.ak = 1;
    fa.querySelector('h2').textContent = 'Tambah / Ubah Akun';
    const st = document.createElement('div'); st.innerHTML = '<label>Status</label><select name="Aktif"><option value="Y">Aktif</option><option value="N">Nonaktif</option></select>'; fa.querySelector('.row').append(st);
    const nb = document.createElement('button'); nb.type = 'button'; nb.className = 'btn'; nb.style.marginLeft = '8px'; nb.textContent = 'Kosongkan Form';
    nb.onclick = () => { fa.reset(); fa.Username.readOnly = false; }; fa.querySelector('button.btn.p').after(nb);
    const lst = document.createElement('div'); lst.className = 'card'; lst.style.marginBottom = '20px';
    lst.innerHTML = '<h2>Daftar Akun Petugas &amp; Pimpinan</h2><div class="tw"><table><thead><tr><th>Username</th><th>Nama</th><th>Peran</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="at"><tr><td colspan="5" class="mu">Memuat...</td></tr></tbody></table></div>';
    fa.before(lst);
    fa.addEventListener('submit', async e => {
      e.preventDefault(); e.stopPropagation(); const b = e.submitter; b.disabled = true;
      const r = await api('akun.simpan', Object.fromEntries(new FormData(fa))); b.disabled = false; toast(r.msg, !r.ok);
      if (r.ok) { fa.reset(); fa.Username.readOnly = false; akunMuat(); }
    });
    akunMuat();
  }

  document.addEventListener('click', async e => {
    const ed = e.target.closest('[data-edit]'), ae = e.target.closest('[data-ae]'), ah = e.target.closest('[data-ah]');
    if (ed) { e.preventDefault(); editFoto(ed.dataset.edit); }
    if (ae) {
      const x = AK.find(a => a.Username === ae.dataset.ae), f = v.querySelector('#fa'); if (!x || !f) return;
      f.Username.value = x.Username; f.Username.readOnly = true; f.Nama.value = x.Nama; f.Role.value = x.Role; f.Aktif.value = x.Aktif === 'Y' ? 'Y' : 'N'; f.password.value = '';
      f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.Nama.focus(); toast('Ubah data lalu klik Simpan Akun. Sandi boleh dikosongkan.');
    }
    if (ah) {
      const u = ah.dataset.ah; if (!confirm(`Hapus akun "${u}"? Tindakan tidak dapat dibatalkan.`)) return;
      ah.disabled = true; const r = await api('akun.hapus', { Username: u }); toast(r.msg, !r.ok); akunMuat();
    }
  });

  const run = () => { fotoLinks(); akun(); };
  new MutationObserver(run).observe(v, { childList: true, subtree: true }); run();
})();
