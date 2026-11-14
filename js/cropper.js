// Pemotong foto (geser + zoom) di Pengaturan → Foto. Hasil JPEG dikecilkan lalu diunggah ke Drive.
(function () {
  const R = { pimpinan: [16, 9], staf: [1, 1], kegiatan: [16, 9] }, UK = { potret: [4, 5], lanskap: [16, 9], persegi: [1, 1] };
  new MutationObserver(() => { const f = document.getElementById('ff'); if (f && !f.dataset.cr) init(f); }).observe(document.getElementById('v'), { childList: true, subtree: true });
  function init(f) {
    f.dataset.cr = 1;
    const u = f.querySelector('[name=Url]'); u.required = false; u.placeholder = 'Atau tempel URL foto (opsional)';
    const box = document.createElement('div');
    box.innerHTML = `<label>Pilih foto dari komputer</label><input type="file" accept="image/*" id="cf" style="padding:8px;height:auto">
    <div id="cw" style="display:none;margin:12px 0"><canvas id="cc" style="width:100%;max-width:360px;border-radius:8px;border:1px solid var(--bd);touch-action:none;cursor:grab;display:block"></canvas>
    <label style="margin-top:10px">Perbesar / perkecil</label><input type="range" id="cz" min="1" max="3" step="0.01" value="1" style="height:auto;max-width:360px">
    <small class="mu">Geser gambar untuk memotong. Rasio mengikuti pengaturan Ukuran Bingkai Foto.</small></div>`;
    f.querySelector('.row').after(box);
    const J = f.querySelector('[name=Jenis]'), c = box.querySelector('#cc'), x = c.getContext('2d'), cw = box.querySelector('#cw');
    let im = null, z = 1, ox = 0, oy = 0, drag = null;
    const dim = () => { const [a, b] = UK[(B.set || {})['bingkai_' + J.value]] || R[J.value] || [16, 9], w = a > b ? 1280 : 800; return [w, Math.round(w * b / a)]; };
    function draw() {
      if (!im) return; const [W, H] = dim(); c.width = W; c.height = H;
      const s = Math.max(W / im.width, H / im.height) * z, w = im.width * s, h = im.height * s, mx = (w - W) / 2, my = (h - H) / 2;
      ox = Math.max(-mx, Math.min(mx, ox)); oy = Math.max(-my, Math.min(my, oy));
      x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.drawImage(im, W / 2 - w / 2 + ox, H / 2 - h / 2 + oy, w, h);
    }
    box.querySelector('#cf').onchange = e => {
      const file = e.target.files[0]; if (!file) return; const i = new Image();
      i.onload = () => { im = i; z = 1; ox = oy = 0; box.querySelector('#cz').value = 1; cw.style.display = 'block'; draw(); URL.revokeObjectURL(i.src); };
      i.onerror = () => toast('File bukan gambar yang valid.', 1); i.src = URL.createObjectURL(file);
    };
    J.onchange = () => { ox = oy = 0; draw(); };
    box.querySelector('#cz').oninput = e => { z = +e.target.value; draw(); };
    c.onwheel = e => { e.preventDefault(); z = Math.max(1, Math.min(3, z - e.deltaY * .002)); box.querySelector('#cz').value = z; draw(); };
    c.onpointerdown = e => { drag = [e.clientX, e.clientY]; c.setPointerCapture(e.pointerId); c.style.cursor = 'grabbing'; };
    c.onpointermove = e => { if (!drag) return; const k = c.width / c.clientWidth; ox += (e.clientX - drag[0]) * k; oy += (e.clientY - drag[1]) * k; drag = [e.clientX, e.clientY]; draw(); };
    c.onpointerup = () => { drag = null; c.style.cursor = 'grab'; };
    f.addEventListener('submit', async e => {
      if (!im) { if (!u.value.trim()) { e.preventDefault(); e.stopPropagation(); toast('Pilih foto atau isi URL foto.', 1); } return; }
      e.preventDefault(); e.stopPropagation();
      const b = e.submitter, t = b.textContent; b.disabled = true; b.textContent = 'Mengunggah...';
      const d = Object.fromEntries(new FormData(f)); delete d.Url; d.data = c.toDataURL('image/jpeg', .85);
      const r = await api('foto.upload', d); b.disabled = false; b.textContent = t; toast(r.msg, !r.ok);
      if (r.ok) { await segarBoot(); render(); }
    });
  }
})();
