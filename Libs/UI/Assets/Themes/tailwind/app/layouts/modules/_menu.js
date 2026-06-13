// Menu: accordion single-open, auto-scroll aktif, accordion generik.
export function initMenu() {
    // ---- Menu: single-open accordion (data-accordion-single dari SpecaMenuOptions) ----
    // Event 'toggle' tidak bubble → pakai capture di root menu.
    const menuRoot = document.getElementById('sidebar_menu');
    if (menuRoot?.dataset.accordionSingle === 'true') {
        menuRoot.addEventListener('toggle', (event) => {
            const details = event.target;
            if (!(details instanceof HTMLDetailsElement) || !details.open) return;
            // Tutup hanya saudara selevel — leluhur/anak tidak ikut menutup.
            details.parentElement?.querySelectorAll(':scope > details[open]').forEach((sibling) => {
                if (sibling !== details) sibling.open = false;
            });
        }, true);
    }

    // ---- Menu: auto-scroll ke item aktif (untuk menu panjang) ----
    document.querySelector('#sidebar .menu-active')?.scrollIntoView({ block: 'nearest' });

    // ---- Accordion generik single-open: <div class="accordion" data-accordion="single"> ----
    document.querySelectorAll('[data-accordion="single"]').forEach((group) => {
        group.addEventListener('toggle', (event) => {
            const details = event.target;
            if (!(details instanceof HTMLDetailsElement) || !details.open) return;
            group.querySelectorAll(':scope > details[open]').forEach((sibling) => {
                if (sibling !== details) sibling.open = false;
            });
        }, true);
    });
}
