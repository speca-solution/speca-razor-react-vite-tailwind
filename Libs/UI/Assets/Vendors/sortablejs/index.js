/*
 * SortableJS (MIT) — drag & drop urut ulang, tanpa jQuery.
 * Entry OPSIONAL: vendors/sortablejs — muat hanya di halaman yang butuh.
 * Auto-init: <ul data-sortable> ... </ul>
 *   data-sortable-handle="<selector>" untuk membatasi area drag (opsional).
 */
import Sortable from 'sortablejs';

window.Sortable = Sortable;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-sortable]').forEach((el) => {
        Sortable.create(el, {
            animation: 150,
            handle: el.dataset.sortableHandle || undefined,
            ghostClass: 'opacity-40',
        });
    });
});
