/*
 * Layout Bootstrap: sidebar = Offcanvas bawaan di < lg, submenu = Collapse bawaan.
 * Tambahan milik sendiri: dark mode (data-bs-theme + localStorage 'speca-theme'),
 * collapse sidebar desktop (persist 'speca-sidebar'), shortcut Ctrl+/ ke search,
 * init tooltip.
 */
document.addEventListener('DOMContentLoaded', () => {
    const { bootstrap } = window;
    const root = document.documentElement;

    if (!bootstrap) {
        console.error('[speca] window.bootstrap belum ada. Muat entry vendors/bootstrap lebih dulu.');
        return;
    }

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
        bootstrap.Tooltip.getOrCreateInstance(el);
    });

    // ---- Dark mode (data-bs-theme, key sama dengan stack Tailwind) ----
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-bs-theme', next);
            localStorage.setItem('speca-theme', next);
        });
    });

    // ---- Collapse sidebar desktop (persist) ----
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
});
