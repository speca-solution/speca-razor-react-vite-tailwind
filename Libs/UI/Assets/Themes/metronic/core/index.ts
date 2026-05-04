/*
 * Metronic
 * @author: Keenthemes
 * Copyright 2024 Keenthemes
 */

import KTDom from './helpers/_dom';
import KTUtils from './helpers/_utils';
import KTEventHandler from './helpers/_event-handler';
import { KTMenu } from './components/menu/_index';
import { KTDatePicker } from './components/date-picker/_index';
import { KTColorPicker } from './components/color-picker/_index';
import { KTSortable } from './components/sortable/_index';
import { KTDropzone } from './components/dropzone/_index';

// Import vanilla-calendar-pro styles
import 'vanilla-calendar-pro/styles/index.css';

export { KTMenu } from './components/menu/_index';
export { KTDatePicker } from './components/date-picker/_index';
export { KTColorPicker } from './components/color-picker/_index';
export { KTSortable } from './components/sortable/_index';
export { KTDropzone } from './components/dropzone/_index';

const KTComponents = {
	init(): void {
		KTMenu.init();
		KTDatePicker.init();
		KTColorPicker.init();
		KTSortable.init();
		KTDropzone.init();
	},
};

declare global {
	interface Window {
		KTUtils: typeof KTUtils;
		KTDom: typeof KTDom;
		KTEventHandler: typeof KTEventHandler;
		KTMenu: typeof KTMenu;
		KTDatePicker: typeof KTDatePicker;
		KTColorPicker: typeof KTColorPicker;
		KTSortable: typeof KTSortable;
		KTDropzone: typeof KTDropzone;
		KTComponents: typeof KTComponents;
	}
}

window.KTUtils = KTUtils;
window.KTDom = KTDom;
window.KTEventHandler = KTEventHandler;
window.KTMenu = KTMenu;
window.KTDatePicker = KTDatePicker;
window.KTColorPicker = KTColorPicker;
window.KTSortable = KTSortable;
window.KTDropzone = KTDropzone;
window.KTComponents = KTComponents;

export default KTComponents;

KTDom.ready(() => {
	KTComponents.init();
});
