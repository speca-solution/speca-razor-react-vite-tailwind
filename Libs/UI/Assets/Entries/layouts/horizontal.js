/*
 * Entry layout HORIZONTAL (entry: libs/ui/layouts/horizontal) — dipakai _Layout2.
 * = base universal + hover-trigger menu horizontal (eksklusif horizontal).
 */
import { initBase } from '../../Scripts/layouts/_base.js';
import { initHorizontalMenu } from '../../Scripts/layouts/_menu-horizontal.js';

document.addEventListener('DOMContentLoaded', () => {
    initBase();
    initHorizontalMenu();
});
