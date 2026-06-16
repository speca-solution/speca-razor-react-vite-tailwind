/*
 * FullCalendar (MIT) — kalender tanpa jQuery. Entry OPSIONAL: vendors/fullcalendar
 * — muat HANYA di halaman yang butuh (via @section Scripts), bukan di layout.
 *
 * Auto-init: <div data-fullcalendar><script type="application/json">{opsi}</script></div>
 * Opsi dibaca sebagai JSON (bukan inline-JS) agar aman walau CSP tanpa 'unsafe-eval'.
 * Warna/rasa mengikuti tema aktif lewat variabel --fc-* yang di-set di
 * theme1/_vendor.css & theme2/_vendor.css (cirikhas berbeda per tema).
 * FullCalendar v6 meng-inject CSS-nya sendiri (style-src 'unsafe-inline' diizinkan).
 */
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
// CSS inti FC di-impor STATIS (di-ekstrak via scripts/build-fullcalendar-css.mjs).
// FC v6 mestinya meng-inject CSS-nya saat runtime, tapi di build rolldown ini injeksi
// menghasilkan 0 rule → kalender tanpa gaya. Impor statis = andal & version-pinned.
import './_fullcalendar.css';
import './_overrides.css';

function init() {
    document.querySelectorAll('[data-fullcalendar]').forEach((el) => {
        if (el.dataset.fcInit) return;
        el.dataset.fcInit = '1';

        const cfgEl = el.querySelector('script[type="application/json"]');
        let opts = {};
        try {
            opts = cfgEl ? JSON.parse(cfgEl.textContent || '{}') : {};
        } catch {
            console.error('[fullcalendar] konfigurasi bukan JSON valid.');
        }

        const calendar = new Calendar(el, {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek',
            },
            buttonText: { today: 'Hari ini', month: 'Bulan', week: 'Minggu', list: 'Agenda' },
            height: 'auto',
            navLinks: true,
            selectable: true,
            // Klik tanggal → umpan balik kecil (pakai toast global bila tersedia).
            dateClick: (info) => {
                if (typeof window.specaToast === 'function') {
                    window.specaToast(`Tanggal dipilih: ${info.dateStr}`, 'primary');
                }
            },
            ...opts,
        });
        calendar.render();
    });
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
