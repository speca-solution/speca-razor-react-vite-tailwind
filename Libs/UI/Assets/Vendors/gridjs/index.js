/*
 * Grid.js (MIT) — datatable interaktif tanpa jQuery (~14KB).
 * Entry OPSIONAL per-halaman: vendors/gridjs — muat hanya di halaman yang butuh
 * (via @section Scripts), bukan di layout.
 *
 * Auto-init: <div data-gridjs><script type="application/json">{ columns, data, ... }</script></div>
 * Config dibaca sebagai JSON (bukan inline-JS) supaya aman di CSP tanpa 'unsafe-inline'.
 * Tema dasar (mermaid) di-impor di sini; penyesuaian token/dark-mode ada di
 * theme.css global (blok ".gridjs-*").
 *
 * Opsi yang dikenali (semua punya default):
 *   columns: array kolom (string | {name, ...})    data: array baris
 *   search: bool (default true)        sort: bool (default true)
 *   pagination: bool | {limit}          resizable: bool (default false)
 *   server: { url, ... }  -> mode server-side (Grid.js fetch sendiri)
 */
import { Grid } from 'gridjs';
import 'gridjs/dist/theme/mermaid.css';
// Override token Speca — setelah tema bawaan agar menang (dipindah dari theme.css).
import './_theme.css';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-gridjs]').forEach((el) => {
        const cfgEl = el.querySelector('script[type="application/json"]');
        if (!cfgEl) return;
        let cfg;
        try {
            cfg = JSON.parse(cfgEl.textContent || '{}');
        } catch (e) {
            console.error('[gridjs] config JSON tidak valid', e);
            return;
        }
        cfgEl.remove();
        el.innerHTML = '';

        const opts = {
            columns: cfg.columns,
            search: cfg.search ?? true,
            sort: cfg.sort ?? true,
            resizable: cfg.resizable ?? false,
            pagination: cfg.pagination === false ? false : (cfg.pagination ?? { limit: 10 }),
            // Teks Bahasa Indonesia (boleh ditimpa lewat cfg.language).
            language: cfg.language ?? {
                search: { placeholder: 'Cari...' },
                pagination: { previous: 'Sebelumnya', next: 'Berikutnya', showing: 'Menampilkan', of: 'dari', to: '–', results: 'data' },
                noRecordsFound: 'Tidak ada data',
                error: 'Gagal memuat data',
            },
        };

        // Sumber data: server-side (fetch) bila ada cfg.server, selain itu data lokal.
        if (cfg.server) opts.server = cfg.server;
        else opts.data = cfg.data ?? [];

        new Grid(opts).render(el);
    });
});
