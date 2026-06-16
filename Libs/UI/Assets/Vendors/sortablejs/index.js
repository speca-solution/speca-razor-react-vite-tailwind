/*
 * SortableJS (MIT) — drag & drop urut ulang, tanpa jQuery.
 * Entry OPSIONAL: vendors/sortablejs — muat hanya di halaman yang butuh.
 * Auto-init: <ul data-sortable> ... </ul>
 *   data-sortable-handle="<selector>" untuk membatasi area drag (opsional).
 *   data-sortable-group="<nama>"      → list dgn group sama bisa SALING tukar item
 *                                        (dasar papan KANBAN — lihat halaman /Advanced).
 */
import Sortable from 'sortablejs';

window.Sortable = Sortable;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-sortable]').forEach((el) => {
        Sortable.create(el, {
            animation: 150,
            handle: el.dataset.sortableHandle || undefined,
            group: el.dataset.sortableGroup || undefined,
            ghostClass: 'opacity-40',
        });
    });
});
