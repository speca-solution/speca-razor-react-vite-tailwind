// DataTable ringan sisi-klien (sort/search/paginate/colvis/child-row).
export function initDatatable() {
    // ---- DataTable ringan: cari + urut kolom + paginate (sisi-klien) ----
    document.querySelectorAll('[data-datatable]').forEach((root) => {
        const table = root.querySelector('table');
        const tbody = table?.querySelector('tbody');
        if (!table || !tbody) return;
        const search = root.querySelector('[data-datatable-search]');
        const pager = root.querySelector('[data-datatable-pager]');
        const pageSize = parseInt(root.dataset.pageSize || '0', 10);
        const rows = [...tbody.querySelectorAll('tr')];
        const headers = [...table.querySelectorAll('th[data-sort]')];
        const cell = (row, i) => row.children[i]?.textContent.trim() ?? '';
        let page = 1, sortCol = -1, sortDir = 1;

        const apply = () => {
            const q = (search?.value || '').toLowerCase();
            let view = rows.filter((r) => !q || r.textContent.toLowerCase().includes(q));
            if (sortCol >= 0) {
                const type = headers.find((h) => h.cellIndex === sortCol)?.dataset.sort || 'text';
                view = [...view].sort((a, b) => {
                    let av = cell(a, sortCol), bv = cell(b, sortCol);
                    if (type === 'number') {
                        av = parseFloat(av.replace(/[^0-9.-]/g, '')) || 0;
                        bv = parseFloat(bv.replace(/[^0-9.-]/g, '')) || 0;
                    }
                    return (av > bv ? 1 : av < bv ? -1 : 0) * sortDir;
                });
            }
            const pages = pageSize > 0 ? Math.max(1, Math.ceil(view.length / pageSize)) : 1;
            if (page > pages) page = pages;
            rows.forEach((r) => { r.style.display = 'none'; });
            const start = pageSize > 0 ? (page - 1) * pageSize : 0;
            const end = pageSize > 0 ? start + pageSize : view.length;
            view.slice(start, end).forEach((r) => { r.style.display = ''; });
            // urutkan ulang DOM agar sort terlihat
            view.forEach((r) => tbody.appendChild(r));
            if (pager && pageSize > 0) {
                pager.innerHTML = '';
                for (let p = 1; p <= pages; p++) {
                    const a = document.createElement('button');
                    a.type = 'button';
                    a.className = 'page-link' + (p === page ? ' active' : '');
                    a.textContent = String(p);
                    a.addEventListener('click', () => { page = p; apply(); });
                    pager.appendChild(a);
                }
            }
        };

        headers.forEach((h) => h.addEventListener('click', () => {
            const idx = h.cellIndex;
            if (sortCol === idx) sortDir *= -1; else { sortCol = idx; sortDir = 1; }
            headers.forEach((o) => o.classList.remove('sort-asc', 'sort-desc'));
            h.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
            apply();
        }));
        search?.addEventListener('input', () => { page = 1; apply(); });
        apply();
    });
}
