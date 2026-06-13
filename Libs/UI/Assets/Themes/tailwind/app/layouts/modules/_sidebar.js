// Sidebar drawer mobile — dipakai SEMUA layout (vertikal & horizontal punya drawer
// burger untuk layar kecil). Bagian BASE.
export function initSidebarDrawer() {
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
}
