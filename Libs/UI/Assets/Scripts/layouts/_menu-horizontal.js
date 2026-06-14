// Menu horizontal: dropdown hover-trigger — HANYA layout horizontal (#horizontal_menu).
// Dipindah dari _header.js agar logika spesifik-horizontal hanya dimuat horizontal.js.
// Hover hanya di perangkat ber-pointer halus; klik tetap berfungsi (touch/aksesibilitas).
// Delay tutup 150ms agar perpindahan kursor tombol→panel tidak menutup dropdown.
export function initHorizontalMenu() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // closeDropdowns lokal: tutup semua panel dropdown (sama perilaku dengan base).
    const closeDropdowns = () => {
        document.querySelectorAll('[data-dropdown-toggle]').forEach((btn) => {
            document.querySelector(btn.dataset.dropdownToggle)?.classList.add('hidden');
        });
    };

    document.querySelectorAll('#horizontal_menu [data-dropdown-toggle]').forEach((btn) => {
        const wrapper = btn.parentElement;
        const panel = document.querySelector(btn.dataset.dropdownToggle);
        if (!wrapper || !panel) return;
        let hideTimer;
        wrapper.addEventListener('mouseenter', () => {
            clearTimeout(hideTimer);
            closeDropdowns();
            panel.classList.remove('hidden');
        });
        wrapper.addEventListener('mouseleave', () => {
            hideTimer = setTimeout(() => panel.classList.add('hidden'), 150);
        });
    });
}
