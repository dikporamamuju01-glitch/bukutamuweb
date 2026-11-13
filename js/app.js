// BUKUTAMUWEB — Frontend SPA. Pindah menu tanpa reload; data tampil dari cache lokal dulu (SWR), lalu disegarkan di latar.
const G = window.APP_CONFIG.GAS_URL;
const TUJ = ['SEKRETARIAT', 'Bidang Pemuda & Olahraga', 'Bidang Pembinaan SMP', 'Bidang Pembinaan SD', 'Bidang Pembinaan Paud & Dikmas'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = (k, v) => v === undefined ? JSON.parse(localStorage.getItem(k) || 'null') : localStorage.setItem(k, JSON.stringify(v));
let S = LS('btd_s'), B = LS('btd_b') || { set: {}, foto: [] }, T = LS('btd_t') || [], FX = LS('btd_fx') !== false;
const hariIni = () => new Date().toLocaleDateString('sv'), jamIni = () => new Date().toTimeString().slice(0, 5);
const hariDari = t => HARI[new Date(t + 'T00:00').getDay()];
const drv = u => { const m = String(u || '').match(/\/d\/([\w-]{20,})|[?&]id=([\w-]{20,})/); return m ? 'https://drive.google.com/thumbnail?id=' + (m[1] || m[2]) + '&sz=w1000' : u; };
const cur = () => (location.hash.split('/')[1] || 'beranda');
const go = h => { location.hash = h; };

// ---- API: POST text/plain (tanpa preflight CORS), pembacaan identik digabung ----
const inf = {};
function api(a, d) {
  const baca = a === 'boot' || a === 'tamu.list', k = a + JSON.stringify(d || {});
  if (baca && inf[k]) return inf[k];
  const p = fetch(G, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ a, t: S && S.t, d }) })
    .then(r => r.json())
    .then(r => { if (r.auth) { S = null; LS('btd_s', null); go('#/login'); } return r; })
    .catch(() => ({ ok: false, msg: 'Koneksi gagal. Coba lagi.' }));
  if (baca) { inf[k] = p; p.finally(() => delete inf[k]); }
  return p;
}
function toast(m, err) { const t = $('#toast'); t.textContent = m; t.className = 'on' + (err ? ' e' : ''); clearTimeout(toast.x); toast.x = setTimeout(() => t.className = '', 3200); }
let AC; function beep() { try { AC = AC || new AudioContext(); const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = 660; g.gain.setValueAtTime(.06, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + .08); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + .09); } catch (e) {} }
window.lb = u => { const l = $('#lb'); $('img', l).src = u; l.classList.add('on'); };

// ---- Tampilan: pengaturan super admin ----
function applySet() {
  const s = B.set, r = document.documentElement.style;
  if (s.aksen) r.setProperty('--pr', s.aksen);
  r.setProperty('--fh', s.font ? `'${s.font}',sans-serif` : "'Space Grotesk',sans-serif");
  document.body.style.backgroundImage = s.bg ? `linear-gradient(rgba(11,15,25,.88),rgba(11,15,25,.95)),url(${drv(s.bg)})` : '';
  document.body.style.backgroundSize = 'cover'; document.body.style.backgroundAttachment = 'fixed';
  document.title = s.judul || 'Buku Tamu Digital';
}
function shell(inner, act) {
  const l = B.set.logo ? `<img class="lg" src="${esc(drv(B.set.logo))}" alt="">` : '';
  const m = [['beranda', 'Beranda'], ['galeri', 'Galeri'], ['isi', 'Pengisian Buku Tamu'], ['about', 'About']];
  return `<header class="nav"><a href="#/beranda" class="br">${l}<b>${esc(B.set.judul || 'Buku Tamu Digital')}</b></a>
  <nav>${m.map(([k, n]) => `<a href="#/${k}" class="${act === k ? 'on' : ''}">${n}</a>`).join('')}</nav>
  <a class="btn" href="${S ? '#/daftar' : '#/login'}">${S ? 'Dashboard' : 'Login Petugas'}</a></header>
  <main class="pg">${inner}</main><footer>© 2026 Dinas Pendidikan Pemuda dan Olahraga Kab. Mamuju · <a href="#" onclick="return fx()">Suara &amp; kupu-kupu: ${FX ? 'Aktif' : 'Mati'}</a></footer>`;
}
function dash(inner, act) {
  const m = [['daftar', 'Daftar Tamu'], ['rekap', 'Rekap Kunjungan']]; if (S.r === 'superadmin') m.push(['set', 'Pengaturan']);
  return `<div class="dsh"><aside><b class="br" style="padding:8px 12px">Panel Admin</b>${m.map(([k, n]) => `<a href="#/${k}" class="${act === k ? 'on' : ''}">${n}</a>`).join('')}
  <div class="usr"><small>${esc(S.n)} · ${esc(S.r)}</small><a class="btn" href="#/beranda">Ke Beranda</a><button class="btn" onclick="keluar()">Keluar</button></div></aside><main class="pg">${inner}</main></div>`;
}
window.fx = () => { FX = !FX; LS('btd_fx', FX); kp.style.display = FX ? '' : 'none'; render(); return false; };
window.keluar = () => { S = null; LS('btd_s', null); go('#/beranda'); };

// ---- Formulir tamu (dipakai halaman publik & ubah data) ----
function fTamu(v = {}) {
  const f = (n, l, w, x = '') => `<div><label>${l}${w ? ' <i>*</i>' : ''}</label><input name="${n}" ${w ? 'required' : ''} value="${esc(v[n] ?? '')}" ${x}></div>`;
  return `<div class="row">${f('Nama', 'Nama lengkap', 1)}${f('NIP', 'NIP / Nomor identitas (opsional)', 0)}</div>
  <div class="row">${f('Instansi', 'Pekerjaan / Asal instansi', 1)}${f('NoHP', 'No. HP / WhatsApp', 1, 'inputmode="tel" placeholder="0812xxxxxxxx"')}</div>
  <div class="row">${f('Tanggal', 'Tanggal kunjungan', 1, 'type="date"')}${f('Jam', 'Jam datang', 1, 'type="time"')}</div>
  <div style="margin-bottom:16px"><label>Tujuan kunjungan <i>*</i></label><select name="Tujuan" required>${TUJ.map(t => `<option ${v.Tujuan === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
  <div style="margin-bottom:16px"><label>Detail tujuan</label><textarea name="Detail" maxlength="300">${esc(v.Detail || '')}</textarea></div>`;
}
const baca = f => Object.fromEntries(new FormData(f));

// ---- Halaman publik ----
const P = {};
P.beranda = () => {
  const f = j => B.foto.filter(x => x.Jenis === j), kartu = x => `<div class="card ph"><img loading="lazy" src="${esc(drv(x.Url))}" alt="${esc(x.Nama)}" onclick="lb(this.src)"><b>${esc(x.Nama)}</b><small>${esc(x.Keterangan)}</small></div>`;
  const sek = (t, j, n) => f(j).length ? `<div class="lab">${t}</div><div class="grid" style="margin-top:8px">${f(j).slice(0, n).map(kartu).join('')}</div>` : '';
  return shell(`<section class="hero"><div class="lab">Portal buku tamu digital resmi</div><h1>Selamat Datang di <span class="cy">${esc(B.set.judul || 'Buku Tamu Digital')}</span></h1>
  <p>Isi data kunjungan Anda dengan cepat, tertib, dan transparan.</p><a class="btn p" href="#/isi">Isi Buku Tamu Sekarang →</a> <a class="btn" href="#/galeri">Lihat Galeri Kegiatan</a></section>
  ${sek('Jajaran Pimpinan', 'pimpinan', 6)}${sek('Staf Kantor', 'staf', 8)}`, 'beranda');
};
P.galeri = () => { const g = B.foto.filter(x => x.Jenis === 'kegiatan'); return shell(`<h1>Galeri Dokumentasi &amp; Kegiatan</h1><p class="mu" style="margin:8px 0 24px">${g.length} foto kegiatan. Klik foto untuk memperbesar.</p><div class="grid">${g.map(x => `<div class="card ph"><img loading="lazy" src="${esc(drv(x.Url))}" alt="" onclick="lb(this.src)"><b>${esc(x.Nama)}</b><small>${esc(x.Keterangan)}</small></div>`).join('') || '<p class="mu">Belum ada foto.</p>'}</div>`, 'galeri'); };
P.about = () => shell(`<h1>Tentang Kami</h1><div class="card" style="margin-top:20px;white-space:pre-line">${esc(B.set.about || 'Informasi kantor belum diisi oleh super admin.')}</div>`, 'about');
P.isi = () => shell(`<div class="two"><form class="card" id="ft"><div class="lab">Langkah 01/01 · Penginputan data kunjungan</div><h1 style="margin:6px 0 20px">Formulir Buku Tamu Digital</h1>${fTamu({ Tanggal: hariIni(), Jam: jamIni() })}
  <div style="display:flex;justify-content:space-between"><button type="reset" class="btn">Reset Formulir</button><button class="btn p">Simpan Data Tamu →</button></div></form>
  <div class="card" id="ok" style="text-align:center"><div class="lab">Pratinjau status</div><p class="mu" style="margin-top:12px">Setelah disimpan, konfirmasi muncul di sini.</p></div></div>`, 'isi');
P.login = () => shell(`<form class="card" id="fl" style="max-width:420px;margin:40px auto"><div class="lab">Portal khusus petugas &amp; pimpinan</div><h1 style="margin:6px 0 20px">Masuk ke Sistem</h1>
  <div style="margin-bottom:16px"><label>Username <i>*</i></label><input name="u" required autocomplete="username"></div><div style="margin-bottom:20px"><label>Kata sandi <i>*</i></label><input name="p" type="password" required autocomplete="current-password"></div>
  <button class="btn p" style="width:100%">Masuk ke Dashboard</button></form>`, '');

// ---- Dashboard ----
const guard = () => { if (!S) { go('#/login'); return false; } return true; };
P.daftar = () => !guard() ? '' : dash(`<div class="lab">Buku tamu digital</div><h1>Daftar Kunjungan Tamu</h1>
  <div class="stats" id="st"></div><div class="card"><div class="tool"><div><label>Tanggal</label><input type="date" id="fd" value="${hariIni()}"></div>
  <div><label>Hari</label><select id="fh"><option value="">Semua</option>${HARI.map(h => `<option>${h}</option>`).join('')}</select></div>
  <div><label>Cari tamu</label><input id="fq" placeholder="Nama, NIP, instansi"></div><button class="btn" id="fr">Reset</button></div>
  <div class="tw"><table><thead><tr><th>No</th><th>Tanggal &amp; jam</th><th>Nama</th><th>NIP</th><th>Instansi</th><th>Tujuan &amp; detail</th><th>No. HP</th>${S.r !== 'pimpinan' ? '<th>Aksi</th>' : ''}</tr></thead><tbody id="tb"></tbody></table></div></div>`, 'daftar');
function drawDaftar() {
  const tb = $('#tb'); if (!tb) return; const d = $('#fd').value, h = $('#fh').value, q = $('#fq').value.toLowerCase();
  const r = T.filter(x => (!d || x.Tanggal === d) && (!h || hariDari(x.Tanggal) === h) && (!q || (x.Nama + x.NIP + x.Instansi).toLowerCase().includes(q)));
  const hi = T.filter(x => x.Tanggal === hariIni());
  $('#st').innerHTML = `<div class="card"><small>TOTAL TAMU HARI INI</small><b>${hi.length}</b></div><div class="card"><small>INSTANSI HARI INI</small><b class="cy">${new Set(hi.map(x => x.Instansi)).size}</b></div><div class="card"><small>TOTAL SEMUA DATA</small><b>${T.length}</b></div>`;
  tb.innerHTML = r.slice(0, 200).map((x, i) => `<tr><td>${i + 1}</td><td><b>${esc(x.Tanggal)}</b><br><small class="cy">${esc(x.Jam)}</small></td><td>${esc(x.Nama)}</td><td><small>${esc(x.NIP) || '-'}</small></td><td><span class="chip">${esc(x.Instansi)}</span></td><td><b>${esc(x.Tujuan)}</b><br><small>${esc(x.Detail)}</small></td><td>${esc(x.NoHP)}</td>${S.r !== 'pimpinan' ? `<td><button class="btn" onclick="ubah('${x.ID}')">Ubah</button> <button class="btn d" onclick="hapus('${x.ID}')">Hapus</button></td>` : ''}</tr>`).join('') || '<tr><td colspan="8" class="mu">Tidak ada data pada filter ini.</td></tr>';
}
window.ubah = id => {
  const v = T.find(x => x.ID === id), m = document.createElement('div'); m.className = 'mod';
  m.innerHTML = `<form class="card"><h2>Ubah Data Tamu</h2>${fTamu(v)}<div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="btn" onclick="this.closest('.mod').remove()">Batal</button><button class="btn p">Simpan</button></div></form>`;
  document.body.append(m);
  $('form', m).onsubmit = async e => { e.preventDefault(); const b = e.submitter; b.disabled = true; const r = await api('tamu.ubah', { ...baca(e.target), ID: id }); b.disabled = false; toast(r.msg, !r.ok); if (r.ok) { m.remove(); muatTamu(); } };
};
window.hapus = async id => { if (!confirm('Hapus data tamu ini? Tindakan tidak dapat dibatalkan.')) return; T = T.filter(x => x.ID !== id); drawDaftar(); const r = await api('tamu.hapus', { ID: id }); toast(r.msg, !r.ok); muatTamu(); };
async function muatTamu() { const r = await api('tamu.list'); if (r.ok && JSON.stringify(r.rows) !== JSON.stringify(T)) { T = r.rows; LS('btd_t', T); } if (['daftar', 'rekap'].includes(cur())) P.after(); }

let RM = 'hari';
P.rekap = () => !guard() ? '' : dash(`<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px"><div><div class="lab">Eksekutif / Pimpinan</div><h1>Laporan &amp; Rekap Kunjungan</h1></div><div class="seg" id="sg">${['hari', 'minggu', 'bulan'].map(m => `<button class="btn ${RM === m ? 'on' : ''}" data-m="${m}">Per ${m[0].toUpperCase() + m.slice(1)}</button>`).join('')}</div></div><div id="rk"></div>`, 'rekap');
function drawRekap() {
  const el = $('#rk'); if (!el) return; const t = hariIni(), pad = n => String(n).padStart(2, '0'); let lab, tg;
  if (RM === 'hari') { lab = [...Array(10)].map((_, i) => pad(7 + i)); tg = x => x.Tanggal === t ? x.Jam.slice(0, 2) : null; }
  else { const ds = RM === 'minggu' ? [...Array(7)].map((_, i) => new Date(Date.now() - (6 - i) * 864e5).toLocaleDateString('sv')) : [...Array(new Date(+t.slice(0, 4), +t.slice(5, 7), 0).getDate())].map((_, i) => t.slice(0, 8) + pad(i + 1)); lab = ds.map(d => d.slice(8)); tg = x => ds.includes(x.Tanggal) ? x.Tanggal.slice(8) : null; }
  const c = {}, rows = T.filter(x => { const k = tg(x); if (k) c[k] = (c[k] || 0) + 1; return !!k; }), val = lab.map(k => c[k] || 0), mx = Math.max(1, ...val), tot = rows.length;
  const tj = {}; rows.forEach(x => tj[x.Tujuan] = (tj[x.Tujuan] || 0) + 1);
  el.innerHTML = `<div class="stats"><div class="card"><small>TOTAL KUNJUNGAN (${RM.toUpperCase()})</small><b>${tot}</b></div><div class="card"><small>RATA-RATA / ${RM === 'hari' ? 'JAM' : 'HARI'}</small><b class="cy">${(tot / lab.length).toFixed(1)}</b></div><div class="card"><small>TUJUAN TERBANYAK</small><b style="font-size:18px">${esc(Object.keys(tj).sort((a, b) => tj[b] - tj[a])[0] || '-')}</b></div></div>
  <div class="two"><div class="card"><h2>Frekuensi kunjungan</h2><div class="bars">${val.map((v, i) => `<div class="bar" title="${lab[i]}: ${v}"><i style="height:${v / mx * 100}%"></i>${lab[i]}</div>`).join('')}</div></div>
  <div class="card"><h2>Distribusi tujuan</h2>${Object.keys(tj).sort((a, b) => tj[b] - tj[a]).map(k => `<p style="display:flex;justify-content:space-between"><span>${esc(k)}</span><b class="cy">${Math.round(tj[k] / tot * 100)}%</b></p>`).join('') || '<p class="mu">Belum ada data.</p>'}</div></div>
  <div class="card" style="margin-top:24px"><h2>Riwayat kunjungan terkini</h2><div class="tw"><table><thead><tr><th>Waktu</th><th>Nama</th><th>Instansi</th><th>Tujuan</th></tr></thead><tbody>${T.slice(0, 10).map(x => `<tr><td>${esc(x.Tanggal)} <small>${esc(x.Jam)}</small></td><td>${esc(x.Nama)}</td><td>${esc(x.Instansi)}</td><td><span class="chip">${esc(x.Tujuan)}</span></td></tr>`).join('')}</tbody></table></div></div>`;
}
P.set = () => !guard() ? '' : S.r !== 'superadmin' ? (go('#/daftar'), '') : dash(`<h1>Pengaturan Aplikasi</h1><form class="card" id="fs" style="margin:20px 0"><h2>Tampilan</h2>
  <div class="row"><div><label>Judul aplikasi</label><input name="judul" value="${esc(B.set.judul || '')}"></div><div><label>Warna aksen</label><input name="aksen" type="color" value="${esc(B.set.aksen || '#3B82F6')}"></div></div>
  <div class="row"><div><label>URL logo</label><input name="logo" value="${esc(B.set.logo || '')}" placeholder="Tautan gambar / Google Drive"></div><div><label>URL background</label><input name="bg" value="${esc(B.set.bg || '')}"></div></div>
  <div class="row"><div><label>Font judul</label><select name="font">${['Space Grotesk', 'Geist'].map(f => `<option ${B.set.font === f ? 'selected' : ''}>${f}</option>`).join('')}</select></div></div>
  <div style="margin-bottom:16px"><label>Teks halaman About</label><textarea name="about">${esc(B.set.about || '')}</textarea></div><button class="btn p">Simpan Tampilan</button></form>
  <form class="card" id="ff" style="margin-bottom:20px"><h2>Foto Beranda &amp; Galeri</h2><div class="row"><div><label>Jenis</label><select name="Jenis"><option>pimpinan</option><option>staf</option><option>kegiatan</option></select></div><div><label>Nama / judul</label><input name="Nama" required></div><div><label>Keterangan</label><input name="Keterangan"></div><div><label>URL foto (Drive/Web)</label><input name="Url" required></div></div><button class="btn p">Tambah Foto</button>
  <div class="grid" style="margin:20px 0 0">${B.foto.map(x => `<div class="card ph"><img src="${esc(drv(x.Url))}" alt=""><b>${esc(x.Nama)}</b><small>${esc(x.Jenis)} <a href="#" class="cy" onclick="return hpsFoto('${x.ID}')">Hapus</a></small></div>`).join('')}</div></form>
  <form class="card" id="fa"><h2>Akun Petugas &amp; Pimpinan</h2><div class="row"><div><label>Username</label><input name="Username" required></div><div><label>Nama</label><input name="Nama"></div><div><label>Peran</label><select name="Role"><option>petugas</option><option>pimpinan</option><option>superadmin</option></select></div><div><label>Sandi (min. 8; kosong = tidak diubah)</label><input name="password" type="password" autocomplete="new-password"></div></div><button class="btn p">Simpan Akun</button></form>`, 'set');
window.hpsFoto = async id => { if (!confirm('Hapus foto ini?')) return false; const r = await api('foto.hapus', { ID: id }); toast(r.msg, !r.ok); await segarBoot(); render(); return false; };

// ---- Router & event (delegasi: tetap hidup setelah render ulang) ----
P.after = () => { applyAfter(); };
function applyAfter() { const c = cur(); if (c === 'daftar') drawDaftar(); if (c === 'rekap') drawRekap(); }
function render() { const c = cur(), f = P[c] || P.beranda; $('#v').innerHTML = f(); applyAfter(); window.scrollTo(0, 0); if (['daftar', 'rekap'].includes(c) && S) muatTamu(); }
async function segarBoot() { const r = await api('boot'); if (r.ok && JSON.stringify([r.set, r.foto]) !== JSON.stringify([B.set, B.foto])) { B = { set: r.set, foto: r.foto }; LS('btd_b', B); applySet(); if (['beranda', 'galeri', 'about'].includes(cur())) render(); } }
addEventListener('hashchange', render);
document.addEventListener('click', e => {
  if (FX && e.target.closest('nav a,aside a')) beep();
  const m = e.target.closest('#sg [data-m]'); if (m) { RM = m.dataset.m; render(); }
  if (e.target.id === 'fr') { $('#fd').value = ''; $('#fh').value = ''; $('#fq').value = ''; drawDaftar(); }
});
document.addEventListener('input', e => { if (e.target.closest('.tool')) drawDaftar(); });
document.addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, b = e.submitter; if (!b) return; b.disabled = true; const d = baca(f); let r;
  if (f.id === 'ft') {
    r = await api('tamu.simpan', d);
    if (r.ok) { $('#ok').innerHTML = `<div class="lab">Pratinjau status</div><h2 class="ok" style="margin:12px 0">✔ ${esc(r.msg)}</h2><p>${esc(d.Nama)} · ${esc(d.Tujuan)}<br><small>${esc(d.Tanggal)} ${esc(d.Jam)}</small></p>`; f.reset(); f.querySelector('[name=Tanggal]').value = hariIni(); f.querySelector('[name=Jam]').value = jamIni(); }
  } else if (f.id === 'fl') {
    r = await api('login', d); if (r.ok) { S = { t: r.t, r: r.r, n: r.n }; LS('btd_s', S); go('#/daftar'); }
  } else if (f.id === 'fs') { r = await api('set.simpan', d); if (r.ok) await segarBoot(); }
  else if (f.id === 'ff') { r = await api('foto.simpan', d); if (r.ok) { await segarBoot(); render(); } }
  else if (f.id === 'fa') { r = await api('akun.simpan', d); if (r.ok) f.reset(); }
  b.disabled = false; if (r) toast(r.msg, !r.ok);
});

// ---- Kupu-kupu pengikut kursor (ringan, berhenti saat tab tidak aktif) ----
const kp = document.createElement('div'); kp.id = 'kp'; kp.textContent = '🦋'; kp.style.display = FX ? '' : 'none'; document.body.append(kp);
let mx = 0, my = 0, px = 0, py = 0; addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
(function l() { if (FX) { px += (mx - px) * .12; py += (my - py) * .12; kp.style.transform = `translate(${px + 14}px,${py + 14}px)`; } requestAnimationFrame(l); })();

// ---- Mulai: tampil instan dari cache, segarkan di latar ----
if (/GANTI|XXXX/.test(G)) document.body.innerHTML = '<p style="padding:40px">Konfigurasi belum lengkap: isi GAS_URL di js/config.js.</p>';
else { fetch(G + '?w=1', { mode: 'no-cors' }).catch(() => {}); applySet(); render(); segarBoot(); }

