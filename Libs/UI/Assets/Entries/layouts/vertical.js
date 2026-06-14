/*
 * Entry layout VERTIKAL (entry: libs/ui/layouts/vertical) — dipakai _Layout1.
 * = base universal + sidebar collapse desktop (eksklusif vertikal).
 */
import { initBase } from '../../Scripts/layouts/_base.js';
import { initSidebarCollapse } from '../../Scripts/layouts/_sidebar-collapse.js';

document.addEventListener('DOMContentLoaded', () => {
    initBase();
    initSidebarCollapse();
});
