/*
 * flatpickr (MIT) — datepicker ringan tanpa jQuery.
 * Entry OPSIONAL: vendors/flatpickr — muat hanya di halaman yang butuh
 * (via @section Scripts), bukan di layout. Auto-init: <input data-flatpickr>.
 */
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import './_overrides.css';

document.addEventListener('DOMContentLoaded', () => {
    flatpickr('[data-flatpickr]', { dateFormat: 'Y-m-d' });
});

window.specaFlatpickr = flatpickr;
