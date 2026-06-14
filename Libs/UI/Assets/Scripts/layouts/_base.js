/*
 * Base layout script (Scripts/layouts/_base.js) — concern UNIVERSAL semua layout
 * (vertical, horizontal, blank, + demoN ke depan). Bukan entry (di luar glob
 * Entries/Themes/Vendors → tak pernah jadi entry); di-import oleh barrel di
 * Entries/layouts/*.js. initBase TIDAK memasang DOMContentLoaded sendiri; barrel-lah
 * yang memanggil initBase() dalam satu listener (urutan terjaga).
 *
 * Modul LAYOUT (dark, sidebar, header, menu) sefolder di Scripts/layouts/.
 * Modul KOMPONEN (modal, controls, advanced, datatable, dropzone, globals) di
 * Scripts/components/. Per-layout (sidebar collapse, hover menu horizontal) ada di
 * barrel layout masing-masing, bukan di sini.
 */
import { initTheme } from './_theme.js';
import { initSidebarDrawer } from './_sidebar.js';
import { initHeader } from './_header.js';
import { initMenu } from './_menu.js';
import { initFormControls } from '../components/_controls.js';
import { initModal } from '../components/_modal.js';
import { initFormAdvanced } from '../components/_advanced.js';
import { initDatatable } from '../components/_datatable.js';
import { initDropzone } from '../components/_dropzone.js';
import '../components/_globals.js';

export function initBase() {
    initTheme();
    initSidebarDrawer();
    initHeader();
    initMenu();
    initFormControls();
    initModal();
    initFormAdvanced();
    initDatatable();
    initDropzone();
}
