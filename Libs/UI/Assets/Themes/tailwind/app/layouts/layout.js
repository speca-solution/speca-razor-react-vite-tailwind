/*
 * Layout Tailwind (entry: themes/tailwind/layouts/layout) — milik sendiri, tanpa dependensi.
 * - Toggle dark mode (persist di localStorage 'speca-theme')
 * - Drawer sidebar mobile ([data-sidebar-toggle] + overlay) & collapse desktop ([data-sidebar-collapse])
 * - Dropdown header ([data-dropdown-toggle="#id"]): toggle, tutup di klik-luar & Escape
 * Accordion menu memakai <details> native — tidak butuh JS.
 */
document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    // ---- Dark mode ----
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const dark = root.classList.toggle('dark');
            localStorage.setItem('speca-theme', dark ? 'dark' : 'light');
        });
    });

    // ---- Sidebar: drawer mobile ----
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('[data-sidebar-overlay]');
    const setSidebar = (open) => {
        if (!sidebar) return;
        sidebar.classList.toggle('-translate-x-full', !open);
        if (overlay) overlay.classList.toggle('hidden', !open);
    };

    document.querySelectorAll('[data-sidebar-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            setSidebar(sidebar?.classList.contains('-translate-x-full'));
        });
    });
    overlay?.addEventListener('click', () => setSidebar(false));

    // ---- Sidebar: collapse desktop (persist) ----
    if (localStorage.getItem('speca-sidebar') === 'collapsed') {
        root.classList.add('sidebar-collapsed');
    }
    document.querySelectorAll('[data-sidebar-collapse]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const collapsed = root.classList.toggle('sidebar-collapsed');
            localStorage.setItem('speca-sidebar', collapsed ? 'collapsed' : 'open');
        });
    });

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
});
