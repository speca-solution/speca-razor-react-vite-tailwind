/*
 * Shepherd.js (MIT) — guided tour / onboarding, tanpa jQuery.
 * Entry OPSIONAL: vendors/shepherd — muat hanya di halaman yang butuh.
 *
 * Pakai: tombol <button data-tour-start="#tourSteps"> + langkah sebagai JSON:
 *   <script type="application/json" id="tourSteps" data-tour-steps>
 *     [ { "element": "#sel", "on": "bottom", "title": "...", "text": "..." }, ... ]
 *   </script>
 * Langkah dibaca sebagai JSON (bukan inline-JS) → aman walau CSP tanpa 'unsafe-eval'.
 * Popup & tombol mengikuti token tema (lihat _overrides.css, kelas .speca-shepherd).
 */
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import './_overrides.css';

function buildTour(steps) {
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'speca-shepherd',
            scrollTo: { behavior: 'smooth', block: 'center' },
            cancelIcon: { enabled: true },
        },
    });

    steps.forEach((s, i) => {
        const last = i === steps.length - 1;
        const buttons = [];
        if (i > 0) buttons.push({ text: 'Kembali', action: () => tour.back(), secondary: true });
        buttons.push({ text: last ? 'Selesai' : 'Lanjut', action: () => (last ? tour.complete() : tour.next()) });

        tour.addStep({
            title: s.title,
            text: s.text,
            attachTo: s.element ? { element: s.element, on: s.on || 'bottom' } : undefined,
            buttons,
        });
    });

    return tour;
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tour-start]');
    if (!btn) return;
    const sel = btn.getAttribute('data-tour-start');
    const cfgEl = (sel && document.querySelector(sel)) || document.querySelector('script[data-tour-steps]');
    let steps = [];
    try {
        steps = cfgEl ? JSON.parse(cfgEl.textContent || '[]') : [];
    } catch {
        console.error('[shepherd] langkah tur bukan JSON valid.');
    }
    if (steps.length) buildTour(steps).start();
});
