/*
 * Entry layout BLANK (entry: themes/tailwind/layouts/blank) — dipakai _LayoutBlank
 * (auth/error/standalone). Hanya base universal: tanpa sidebar collapse & menu horizontal.
 * Init base aman (semua modul self-gating; no-op bila selektornya tak ada di halaman).
 */
import { initBase } from './_base.js';

document.addEventListener('DOMContentLoaded', () => {
    initBase();
});
