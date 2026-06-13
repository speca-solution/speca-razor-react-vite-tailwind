// Modal <dialog>, drawer generik, tabs.
export function initModal() {
    // ---- Modal <dialog>: data-modal-open="#id" / data-modal-dismiss ----
    document.querySelectorAll('[data-modal-open]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelector(btn.dataset.modalOpen)?.showModal();
        });
    });
    document.querySelectorAll('dialog.modal').forEach((dialog) => {
        dialog.querySelectorAll('[data-modal-dismiss]').forEach((btn) => {
            btn.addEventListener('click', () => dialog.close(btn.dataset.modalDismiss || ''));
        });
        // klik backdrop = klik elemen dialog itu sendiri (bukan isinya)
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });
    });

    // ---- Drawer generik: data-drawer-open="#id" / data-drawer-dismiss ----
    const closeDrawer = (drawer) => {
        drawer.classList.remove('open');
        document.querySelector('.drawer-backdrop')?.remove();
    };
    document.querySelectorAll('[data-drawer-open]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const drawer = document.querySelector(btn.dataset.drawerOpen);
            if (!drawer) return;
            const backdrop = document.createElement('div');
            backdrop.className = 'drawer-backdrop';
            backdrop.addEventListener('click', () => closeDrawer(drawer));
            document.body.appendChild(backdrop);
            drawer.classList.add('open');
        });
    });
    document.querySelectorAll('.drawer [data-drawer-dismiss]').forEach((btn) => {
        btn.addEventListener('click', () => closeDrawer(btn.closest('.drawer')));
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.querySelectorAll('.drawer.open').forEach(closeDrawer);
        }
    });

    // ---- Tabs: [data-tabs] > [data-tab-target="#panel"] ----
    document.querySelectorAll('[data-tabs]').forEach((group) => {
        const toggles = group.querySelectorAll('[data-tab-target]');
        toggles.forEach((toggle) => {
            toggle.addEventListener('click', () => {
                toggles.forEach((other) => {
                    other.classList.toggle('tab-active', other === toggle);
                    const panel = document.querySelector(other.dataset.tabTarget);
                    panel?.classList.toggle('hidden', other !== toggle);
                });
            });
        });
    });
}
