// Dark mode (light/dark) toggle — persist localStorage.
// Catatan: pemilihan theme1/theme2 kini saat BUILD (endpoint style.css → _theme1/_theme2),
// bukan toggle runtime — jadi tak ada lagi skin toggle di sini.
export function initTheme() {
    const root = document.documentElement;

    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const dark = root.classList.toggle('dark');
            localStorage.setItem('speca-theme', dark ? 'dark' : 'light');
        });
    });
}
