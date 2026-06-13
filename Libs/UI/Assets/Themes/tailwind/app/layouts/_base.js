/*
 * Base layout script — concern UNIVERSAL yang dipakai SEMUA layout (vertical,
 * horizontal, blank, + demoN ke depan). Bukan entry (prefix `_` → di-skip
 * getEntryPoints, ter-bundle ke entry pemanggilnya: vertical.js/horizontal.js/blank.js).
 *
 * Per-layout (sidebar collapse, hover menu horizontal) TIDAK di sini — ada di
 * entry layout masing-masing. initBase TIDAK memasang DOMContentLoaded sendiri;
 * entry-lah yang memanggil initBase() di dalam satu DOMContentLoaded (urutan terjaga).
 */
import { initTheme } from './modules/_theme.js';
import { initSidebarDrawer } from './modules/_sidebar.js';
import { initHeader } from './modules/_header.js';
import { initMenu } from './modules/_menu.js';
import { initFormControls } from './modules/_controls.js';
import { initModal } from './modules/_modal.js';
import { initFormAdvanced } from './modules/_advanced.js';
import { initDatatable } from './modules/_datatable.js';
import { initDropzone } from './modules/_dropzone.js';
import './modules/_globals.js';

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
