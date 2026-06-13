/*
 * Tom Select (Apache-2.0) — select advanced (search, multi, tags) tanpa jQuery.
 * Entry OPSIONAL: vendors/tom-select — muat hanya di halaman yang butuh
 * (via @section Scripts), bukan di layout. Auto-init: <select data-tom-select>.
 */
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';
import './_overrides.css';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-tom-select]').forEach((el) => {
        if (!el.tomselect) {
            new TomSelect(el, { plugins: ['remove_button'] });
        }
    });
});

window.SpecaTomSelect = TomSelect;
