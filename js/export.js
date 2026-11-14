// Ekspor Daftar Tamu (sesuai filter aktif): Excel (CSV) dan Cetak/PDF. Dihitung di browser, tanpa menunggu server.
(function () {
  const st = document.createElement('style');
  st.textContent = '@media print{.dsh aside,.tool,.stats,.nav,#toast,#kp,footer,#dr,#dm,.hb,.dsh table .btn{display:none!important}.dsh{display:block}*{background:#fff!important;color:#000!important;box-shadow:none!important}.pg{padding:0}}';
  document.head.append(st);
  const rows = () => { const d = $('#fd').value, h = $('#fh').value, q = $('#fq').value.toLowerCase(); return T.filter(x => (!d || x.Tanggal === d) && (!h || hariDari(x.Tanggal) === h) && (!q || (x.Nama + x.NIP + x.Instansi).toLowerCase().includes(q))); };
  const q = s => '"' + String(s ?? '').replace(/"/g, '""') + '"', t = s => s ? '="' + String(s).replace(/"/g, '""') + '"' : '""'; // t(): jaga angka 0 di depan
  function csv() {
    const r = rows(), out = ['sep=;', ['Tanggal', 'Jam', 'Nama', 'NIP', 'Instansi', 'Tujuan', 'Detail', 'No. HP'].join(';')]
      .concat(r.map(x => [q(x.Tanggal), q(x.Jam), q(x.Nama), t(x.NIP), q(x.Instansi), q(x.Tujuan), q(x.Detail), t(x.NoHP)].join(';')));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + out.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'buku-tamu-' + hariIni() + '.csv'; a.click(); toast(r.length + ' baris diekspor ke Excel.');
  }
  const add = () => {
    const bar = document.querySelector('.tool'); if (!bar || bar.dataset.ex) return; bar.dataset.ex = 1;
    const mk = (n, f) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = n; b.onclick = f; bar.append(b); };
    mk('Ekspor Excel', csv); mk('Cetak / PDF', () => print());
  };
  new MutationObserver(add).observe(document.getElementById('v'), { childList: true, subtree: true }); add();
})();
