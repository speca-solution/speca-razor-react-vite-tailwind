// Utilitas global + image-input. Di-import sebagai efek-samping (mendefinisikan
// window.specaBlock/specaToast saat eval, sama seperti versi monolit sebelumnya).
// ---- BlockUI: window.specaBlock(selector|el, show, teks) — container harus position:relative ----
window.specaBlock = (target, show = true, text = 'Memuat...') => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    el.querySelector(':scope > .blockui-overlay')?.remove();
    if (show) {
        const overlay = document.createElement('div');
        overlay.className = 'blockui-overlay';
        overlay.innerHTML = `<span class="spinner text-primary"></span><span>${text}</span>`;
        el.appendChild(overlay);
    }
};

// ---- Toast: window.specaToast(pesan, variant, timeoutMs) ----
window.specaToast = (message, variant = 'primary', timeoutMs = 4000) => {
    let container = document.getElementById('toast_container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast_container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${variant}`;
    toast.setAttribute('role', 'status');

    const text = document.createElement('div');
    text.className = 'grow';
    text.textContent = message;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-icon -me-1 size-6';
    close.innerHTML = '<i class="ti ti-x text-sm"></i>';
    close.addEventListener('click', () => toast.remove());

    toast.append(text, close);
    container.appendChild(toast);

    if (timeoutMs > 0) setTimeout(() => toast.remove(), timeoutMs);
};

// ---- Aksi deklaratif via data-* (pengganti handler onclick inline yang dilarang CSP) ----
// Satu listener delegatif untuk seluruh dokumen. Tombol cukup mendeklarasikan:
//   data-toast="pesan" [data-toast-variant="success|warning|danger|primary"]
//   data-block-demo="#selector" [data-block-ms="2000"]   → BlockUI sementara
//   data-remove-closest="selector"                         → hapus elemen leluhur terdekat
//   data-action="reload|back|avatar-reset"                 → aksi bernama
//     avatar-reset: data-avatar-target="#img" data-avatar-src="url"
document.addEventListener('click', (e) => {
    const el = e.target.closest(
        '[data-toast],[data-block-demo],[data-remove-closest],[data-action]'
    );
    if (!el) return;

    if (el.hasAttribute('data-toast')) {
        window.specaToast(el.getAttribute('data-toast'), el.getAttribute('data-toast-variant') || 'primary');
    }

    const blockSel = el.getAttribute('data-block-demo');
    if (blockSel) {
        const ms = parseInt(el.getAttribute('data-block-ms') || '2000', 10);
        window.specaBlock(blockSel, true);
        setTimeout(() => window.specaBlock(blockSel, false), ms);
    }

    const removeSel = el.getAttribute('data-remove-closest');
    if (removeSel) el.closest(removeSel)?.remove();

    switch (el.getAttribute('data-action')) {
        case 'reload': location.reload(); break;
        case 'back': history.back(); break;
        case 'avatar-reset': {
            const img = document.querySelector(el.getAttribute('data-avatar-target') || '#avatarImg');
            const src = el.getAttribute('data-avatar-src');
            if (img && src) img.src = src;
            break;
        }
    }
});

// ---- Image input preview (event delegation agar bekerja di semua halaman) ----
document.addEventListener('change', function (e) {
    const input = e.target;
    if (!input.matches('.image-input input[type="file"]')) return;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const img = input.closest('.image-input')?.querySelector('img');
        if (img && ev.target?.result) img.src = String(ev.target.result);
    };
    reader.readAsDataURL(file);
});
