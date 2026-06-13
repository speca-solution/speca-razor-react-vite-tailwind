// Ctrl+/ search + dropdown header (klik). Bagian BASE — dipakai semua layout.
// Catatan: hover-trigger menu horizontal dipindah ke _menu-horizontal.js agar
// hanya dimuat oleh horizontal.js (pemisahan base vs per-layout sungguhan).
export function initHeader() {
    // ---- Ctrl+/ fokus ke search ----
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === '/') {
            event.preventDefault();
            document.querySelector('[data-search-input]')?.focus();
        }
    });

    // ---- Dropdown header ----
    const closeDropdowns = () => {
        document.querySelectorAll('[data-dropdown-toggle]').forEach((btn) => {
            document.querySelector(btn.dataset.dropdownToggle)?.classList.add('hidden');
        });
    };

    document.querySelectorAll('[data-dropdown-toggle]').forEach((btn) => {
        const panel = document.querySelector(btn.dataset.dropdownToggle);
        if (!panel) return;
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = !panel.classList.contains('hidden');
            closeDropdowns();
            if (!isOpen) panel.classList.remove('hidden');
        });
        panel.addEventListener('click', (event) => event.stopPropagation());
    });

    document.addEventListener('click', closeDropdowns);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeDropdowns();
    });
}
