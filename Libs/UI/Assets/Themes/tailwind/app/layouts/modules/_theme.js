// Dark mode (light/dark) + skin (theme1/theme2) toggle — keduanya persist localStorage.
// Skin = SKIN OVERLAY: theme2 hanya menimpa sebagian token CSS di atas base bersama,
// jadi "ganti tema" = flip kelas `.theme2` di <html> (bukan memuat stylesheet lain).
// Default skin = theme1 (tanpa kelas tambahan, memakai token :root base).
export function initTheme() {
    const root = document.documentElement;

    // ---- Dark mode ----
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const dark = root.classList.toggle('dark');
            localStorage.setItem('speca-theme', dark ? 'dark' : 'light');
        });
    });

    // ---- Skin theme1 / theme2 ----
    document.querySelectorAll('[data-skin-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const theme2 = root.classList.toggle('theme2');
            localStorage.setItem('speca-skin', theme2 ? 'theme2' : 'theme1');
        });
    });
}
