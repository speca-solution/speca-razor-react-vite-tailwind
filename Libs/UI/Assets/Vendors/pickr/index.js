/*
 * Pickr (@simonwep/pickr, MIT) — color picker tanpa jQuery.
 * Entry OPSIONAL: vendors/pickr — muat hanya di halaman yang butuh.
 * Auto-init: <button data-color-picker data-default="#7367f0"></button>
 */
import Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/nano.min.css';
import './_overrides.css';

window.Pickr = Pickr;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-color-picker]').forEach((el) => {
        Pickr.create({
            el,
            theme: 'nano',
            default: el.dataset.default || '#1b84ff',
            components: {
                preview: true,
                opacity: true,
                hue: true,
                interaction: { hex: true, rgba: true, input: true, save: true },
            },
        });
    });
});
