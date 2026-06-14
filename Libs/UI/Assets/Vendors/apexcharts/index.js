/*
 * ApexCharts (MIT) — grafik tanpa jQuery.
 * Entry OPSIONAL: vendors/apexcharts — muat hanya di halaman yang butuh
 * (via @section Scripts), bukan di layout.
 *
 * Auto-init: <div data-apexchart><script type="application/json">{...opsi}</script></div>
 * Config dibaca sebagai JSON (bukan inline-JS) supaya tetap aman walau CSP
 * tanpa 'unsafe-inline'. Warna default mengikuti --primary tema aktif.
 */
// Build MODULAR (ApexCharts v5): impor core + hanya tipe chart yang dipakai
// template ini, bukan seluruh library. Memangkas bundle drastis.
//   line      -> line, area, scatter, bubble, rangeArea
//   bar       -> bar, column, stacked, rangeBar
//   donut     -> donut, pie
//   radialBar -> radialBar (dipakai Dashboard Vuexy "Target Bulanan")
// Butuh tipe lain (radar, heatmap, dst.)? Tambahkan import 'apexcharts/<tipe>'.
// tooltip sudah termasuk core; legend dimuat eksplisit (dipakai donut).
import ApexCharts from 'apexcharts/core';
import 'apexcharts/line';
import 'apexcharts/bar';
import 'apexcharts/donut';
import 'apexcharts/radialBar';
import 'apexcharts/features/legend';

window.ApexCharts = ApexCharts;

function primaryColor() {
    return (
        getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() ||
        '#1b84ff'
    );
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-apexchart]').forEach((el) => {
        const cfgEl = el.querySelector('script[type="application/json"]');
        if (!cfgEl) return;
        let options;
        try {
            options = JSON.parse(cfgEl.textContent || '{}');
        } catch (e) {
            console.error('[apexchart] config JSON tidak valid', e);
            return;
        }
        cfgEl.remove();
        if (!options.colors) options.colors = [primaryColor()];

        // Selaraskan teks/grid/tooltip dengan mode terang/gelap aktif.
        const isDark = document.documentElement.classList.contains('dark');
        options.chart = options.chart || {};
        if (!options.chart.foreColor) options.chart.foreColor = isDark ? '#9ca3af' : '#4b5563';
        options.tooltip = options.tooltip || {};
        if (!options.tooltip.theme) options.tooltip.theme = isDark ? 'dark' : 'light';
        options.grid = options.grid || {};
        if (!options.grid.borderColor) {
            options.grid.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        }

        new ApexCharts(el, options).render();
    });
});
