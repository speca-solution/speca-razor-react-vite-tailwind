/*
 * Swiper (MIT) — carousel/slider sentuh, tanpa jQuery. Entry OPSIONAL: vendors/swiper.
 *
 * Markup: <div class="swiper" data-swiper>
 *           <div class="swiper-wrapper">
 *             <div class="swiper-slide">…</div> …
 *           </div>
 *           <div class="swiper-pagination"></div>
 *           <div class="swiper-button-prev"></div><div class="swiper-button-next"></div>
 *         </div>
 * Opsi tambahan (opsional) via <script type="application/json"> di dalam elemen (aman-CSP).
 * Warna bullet/panah ikut --primary tema aktif (lihat _overrides.css, --swiper-theme-color).
 */
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './_overrides.css';

function init() {
    document.querySelectorAll('[data-swiper]').forEach((el) => {
        if (el.dataset.swiperInit) return;
        el.dataset.swiperInit = '1';

        let opts = {};
        const cfgEl = el.querySelector(':scope > script[type="application/json"]');
        try {
            opts = cfgEl ? JSON.parse(cfgEl.textContent || '{}') : {};
        } catch {
            console.error('[swiper] konfigurasi bukan JSON valid.');
        }

        new Swiper(el, {
            modules: [Navigation, Pagination, Autoplay, Keyboard],
            loop: true,
            spaceBetween: 16,
            keyboard: { enabled: true },
            pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
            navigation: {
                nextEl: el.querySelector('.swiper-button-next'),
                prevEl: el.querySelector('.swiper-button-prev'),
            },
            ...opts,
        });
    });
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
