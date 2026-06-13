/*
 * Entry layout VERTIKAL (entry: themes/tailwind/layouts/vertical) — dipakai _Layout1.
 * = base universal + sidebar collapse desktop (eksklusif vertikal).
 */
import { initBase } from './_base.js';
import { initSidebarCollapse } from './modules/_sidebar-collapse.js';

document.addEventListener('DOMContentLoaded', () => {
    initBase();
    initSidebarCollapse();
});
