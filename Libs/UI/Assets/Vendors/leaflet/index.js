/*
 * Leaflet (BSD-2) — peta interaktif, tanpa jQuery. Entry OPSIONAL: vendors/leaflet.
 *
 * Auto-init: <div data-map data-lat="-6.2" data-lng="106.8" data-zoom="12" data-label="..."></div>
 * Marker pakai circleMarker berwarna --primary (tanpa file ikon → tak ada aset 404 / CSP ekstra).
 * Tile dari OpenStreetMap (https <img>) — diizinkan CSP img-src 'self' data: https:.
 * Catatan: data-map butuh tinggi (di-set di _overrides.css).
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './_overrides.css';

function primaryColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#1b84ff';
}

function init() {
    document.querySelectorAll('[data-map]').forEach((el) => {
        if (el.dataset.mapInit) return;
        el.dataset.mapInit = '1';

        const lat = parseFloat(el.dataset.lat) || -6.2088;
        const lng = parseFloat(el.dataset.lng) || 106.8456;
        const zoom = parseInt(el.dataset.zoom || '12', 10);

        const map = L.map(el).setView([lat, lng], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const color = primaryColor();
        L.circleMarker([lat, lng], { radius: 9, color, fillColor: color, fillOpacity: 0.5, weight: 2 })
            .addTo(map)
            .bindPopup(el.dataset.label || 'Lokasi');
    });
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
