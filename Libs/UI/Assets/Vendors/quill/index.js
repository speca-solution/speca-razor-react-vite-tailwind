/*
 * Quill (BSD-3) — rich text editor (WYSIWYG) tanpa jQuery.
 * Entry OPSIONAL: vendors/quill — muat hanya di halaman yang butuh.
 * Auto-init: <div data-quill data-quill-placeholder="..."></div>
 */
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './_overrides.css';

window.Quill = Quill;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-quill]').forEach((el) => {
        new Quill(el, {
            theme: 'snow',
            placeholder: el.dataset.quillPlaceholder || 'Tulis sesuatu...',
        });
    });
});
