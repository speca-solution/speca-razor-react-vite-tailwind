/*
 * Entry layout BLANK (entry: libs/ui/layouts/blank) — dipakai _LayoutBlank
 * (auth/error/standalone). Hanya base universal: tanpa sidebar collapse & menu horizontal.
 * Init base aman (semua modul self-gating; no-op bila selektornya tak ada di halaman).
 */
import { initBase } from '../../Scripts/layouts/_base.js';

document.addEventListener('DOMContentLoaded', () => {
    initBase();
});
