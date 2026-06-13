/*
 * Entry layout HORIZONTAL (entry: themes/tailwind/layouts/horizontal) — dipakai _Layout2.
 * = base universal + hover-trigger menu horizontal (eksklusif horizontal).
 */
import { initBase } from './_base.js';
import { initHorizontalMenu } from './modules/_menu-horizontal.js';

document.addEventListener('DOMContentLoaded', () => {
    initBase();
    initHorizontalMenu();
});
