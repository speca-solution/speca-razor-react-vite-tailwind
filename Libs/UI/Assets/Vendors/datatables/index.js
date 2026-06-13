/*
 * DataTables.net (MIT) — datatable fitur-lengkap.
 * Entry OPSIONAL per-halaman: vendors/datatables — muat HANYA di halaman yang
 * butuh (via @section Scripts). jQuery DI-BUNDLE ke dalam chunk ini saja dan
 * TIDAK pernah masuk layout/halaman lain — prinsip "no-jQuery global" terjaga.
 *
 * Ekstensi disertakan: Responsive, Select, Buttons (copy/csv/print).
 * (Excel/PDF sengaja DITINGGALKAN karena menarik jszip/pdfmake yang berat.)
 *
 * Auto-init: bungkus tabel dengan <div data-datatables> dan sertakan
 * <script type="application/json">{ ...opsi DataTables }</script> di dalamnya.
 * Opsi dibaca sebagai JSON (CSP-safe). Default: responsive, select, paging 10,
 * dengan tombol copy/csv/print.
 */
import $ from 'jquery';
import DataTable from 'datatables.net-dt';
import 'datatables.net-responsive-dt';
import 'datatables.net-select-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';

import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-responsive-dt/css/responsive.dataTables.css';
import 'datatables.net-select-dt/css/select.dataTables.css';
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
// Override token Speca — setelah CSS bawaan agar menang (dipindah dari theme.css).
import './_theme.css';

// Ekspos ke window agar plugin/inisialisasi pihak ketiga (jika ada) menemukannya.
window.jQuery = window.$ = $;

// Terjemahan default Bahasa Indonesia (bisa ditimpa lewat opsi .language).
const DEFAULT_LANG = {
    search: 'Cari:',
    lengthMenu: 'Tampil _MENU_ data',
    info: 'Menampilkan _START_–_END_ dari _TOTAL_ data',
    infoEmpty: 'Tidak ada data',
    infoFiltered: '(disaring dari _MAX_ total)',
    zeroRecords: 'Tidak ada data yang cocok',
    emptyTable: 'Tidak ada data',
    paginate: { first: 'Awal', last: 'Akhir', next: 'Berikutnya', previous: 'Sebelumnya' },
    buttons: { copyTitle: 'Disalin', copySuccess: { 1: '1 baris disalin', _: '%d baris disalin' } },
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-datatables]').forEach((wrap) => {
        const table = wrap.matches('table') ? wrap : wrap.querySelector('table');
        if (!table) return;

        const cfgEl = wrap.querySelector('script[type="application/json"]');
        let options = {};
        if (cfgEl) {
            try { options = JSON.parse(cfgEl.textContent || '{}'); }
            catch (e) { console.error('[datatables] config JSON tidak valid', e); }
            cfgEl.remove();
        }

        // Default masuk akal (bisa ditimpa oleh JSON config).
        options.responsive = options.responsive ?? true;
        options.select = options.select ?? true;
        options.pageLength = options.pageLength ?? 10;
        options.language = { ...DEFAULT_LANG, ...(options.language || {}) };
        // DataTables 2.x memakai `layout`; taruh tombol di kiri-atas jika belum diset.
        if (!options.layout) {
            options.layout = { topStart: 'buttons', topEnd: 'search', bottomStart: 'info', bottomEnd: 'paging' };
        }
        options.buttons = options.buttons ?? ['copy', 'csv', 'print'];

        new DataTable(table, options);
    });
});
