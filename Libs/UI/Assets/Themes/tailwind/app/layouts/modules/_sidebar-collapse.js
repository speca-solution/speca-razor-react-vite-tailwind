// Sidebar collapse desktop (persist) — HANYA layout vertikal (sidebar tetap di kiri).
// Layout horizontal tak punya sidebar desktop, jadi modul ini eksklusif diimpor
// vertical.js (terpisah dari _sidebar.js drawer agar tak ikut ke chunk base).
export function initSidebarCollapse() {
    const root = document.documentElement;

    if (localStorage.getItem('speca-sidebar') === 'collapsed') {
        root.classList.add('sidebar-collapsed');
    }
    document.querySelectorAll('[data-sidebar-collapse]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const collapsed = root.classList.toggle('sidebar-collapsed');
            localStorage.setItem('speca-sidebar', collapsed ? 'collapsed' : 'open');
        });
    });
}
