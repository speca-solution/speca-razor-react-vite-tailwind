// Dropzone multi-file (pilih/drag/hapus).
export function initDropzone() {
    // ---- Dropzone: pilih/drag banyak file, daftar bisa dihapus ----
    document.querySelectorAll('[data-dropzone]').forEach((dz) => {
        const zone = dz.querySelector('.dropzone');
        const input = dz.querySelector('input[type="file"]');
        const list = dz.querySelector('[data-dropzone-list]');
        if (!zone || !input) return;
        const files = [];
        const fmt = (n) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;
        const render = () => {
            if (!list) return;
            list.innerHTML = '';
            files.forEach((f, i) => {
                const row = document.createElement('div');
                row.className = 'dropzone-file';
                const icon = document.createElement('i');
                icon.className = 'ti ti-file';
                const name = document.createElement('span');
                name.className = 'grow truncate';
                name.textContent = f.name;
                const size = document.createElement('span');
                size.className = 'text-muted-foreground';
                size.textContent = fmt(f.size);
                const rm = document.createElement('button');
                rm.type = 'button';
                rm.setAttribute('aria-label', 'Hapus');
                rm.innerHTML = '<i class="ti ti-x"></i>';
                rm.addEventListener('click', () => { files.splice(i, 1); render(); });
                row.append(icon, name, size, rm);
                list.appendChild(row);
            });
        };
        const add = (fileList) => { [...fileList].forEach((f) => files.push(f)); render(); };
        zone.addEventListener('click', () => input.click());
        input.addEventListener('change', () => add(input.files));
        ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('dragover'); }));
        ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('dragover'); }));
        zone.addEventListener('drop', (e) => { if (e.dataTransfer?.files) add(e.dataTransfer.files); });
    });
}
