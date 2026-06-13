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

    // ---- Dropdown menu horizontal: hover-trigger, hanya perangkat ber-pointer halus.
    //      Click tetap berfungsi (touch / aksesibilitas). Delay tutup 150ms agar
    //      perpindahan kursor tombol→panel tidak menutup dropdown. ----
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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

    // ---- Input number: [data-stepper] > tombol [data-stepper-down] / [data-stepper-up] ----
    document.querySelectorAll('[data-stepper]').forEach((wrap) => {
        const input = wrap.querySelector('input');
        if (!input) return;
        const step = parseFloat(input.step || '1') || 1;
        const clamp = (value) => {
            if (input.min !== '' && value < +input.min) return +input.min;
            if (input.max !== '' && value > +input.max) return +input.max;
            return value;
        };
        wrap.querySelector('[data-stepper-down]')?.addEventListener('click', () => {
            input.value = clamp((parseFloat(input.value) || 0) - step);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        wrap.querySelector('[data-stepper-up]')?.addEventListener('click', () => {
            input.value = clamp((parseFloat(input.value) || 0) + step);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });

    // ---- Toggle password: tombol [data-toggle-password="#inputId"] ----
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const input = document.querySelector(btn.dataset.togglePassword);
            if (!input) return;
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.querySelector('i')?.classList.toggle('ti-eye', !show);
            btn.querySelector('i')?.classList.toggle('ti-eye-off', show);
        });
    });

    // ---- Rating: [data-rating] berisi tombol bintang + input hidden ----
    document.querySelectorAll('[data-rating]').forEach((wrap) => {
        const stars = [...wrap.querySelectorAll('button')];
        const hidden = wrap.querySelector('input[type="hidden"]');
        const paint = (value) => stars.forEach((star, index) => {
            star.classList.toggle('active', index < value);
            star.querySelector('i')?.classList.toggle('ti-star-filled', index < value);
            star.querySelector('i')?.classList.toggle('ti-star', index >= value);
        });
        stars.forEach((star, index) => star.addEventListener('click', () => {
            const value = index + 1;
            if (hidden) hidden.value = String(value);
            paint(value);
        }));
        paint(parseInt(hidden?.value || '0', 10));
    });

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

    // ---- Range slider: isi track (--p) + tampilkan nilai di [data-range-value] ----
    document.querySelectorAll('input[type="range"].range').forEach((range) => {
        const wrap = range.closest('[data-range-wrap]');
        const out = wrap?.querySelector('[data-range-value]');
        const update = () => {
            const min = Number(range.min || 0);
            const max = Number(range.max || 100);
            const pct = max > min ? ((Number(range.value) - min) / (max - min)) * 100 : 0;
            range.style.setProperty('--p', `${pct}%`);
            if (out) out.textContent = range.value;
        };
        range.addEventListener('input', update);
        update();
    });

    // ---- OTP / PIN: auto-advance, backspace mundur, paste tersebar ----
    document.querySelectorAll('.pin-input').forEach((wrap) => {
        const cells = [...wrap.querySelectorAll('input:not([type="hidden"])')];
        const hidden = wrap.querySelector('input[type="hidden"]');
        const sync = () => { if (hidden) hidden.value = cells.map((c) => c.value).join(''); };
        cells.forEach((cell, i) => {
            cell.setAttribute('maxlength', '1');
            cell.setAttribute('inputmode', 'numeric');
            cell.addEventListener('input', () => {
                cell.value = cell.value.replace(/\D/g, '').slice(0, 1);
                if (cell.value && i < cells.length - 1) cells[i + 1].focus();
                sync();
            });
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !cell.value && i > 0) cells[i - 1].focus();
            });
            cell.addEventListener('paste', (e) => {
                e.preventDefault();
                const digits = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').split('');
                cells.forEach((c, j) => { c.value = digits[j] || ''; });
                cells[Math.min(digits.length, cells.length - 1)]?.focus();
                sync();
            });
        });
    });

    // ---- Wizard / Stepper: [data-wizard] dengan .wizard-step + [data-wizard-pane] ----
    document.querySelectorAll('[data-wizard]').forEach((wiz) => {
        const steps = [...wiz.querySelectorAll('.wizard-step')];
        const panes = [...wiz.querySelectorAll('[data-wizard-pane]')];
        let cur = 0;
        const render = () => {
            steps.forEach((s, i) => {
                s.classList.toggle('active', i === cur);
                s.classList.toggle('done', i < cur);
            });
            panes.forEach((p, i) => p.classList.toggle('hidden', i !== cur));
            wiz.querySelectorAll('[data-wizard-prev]').forEach((b) => { b.disabled = cur === 0; });
            wiz.querySelectorAll('[data-wizard-next]').forEach((b) => { b.disabled = cur === panes.length - 1; });
        };
        wiz.querySelectorAll('[data-wizard-next]').forEach((b) =>
            b.addEventListener('click', () => { if (cur < panes.length - 1) { cur++; render(); } }));
        wiz.querySelectorAll('[data-wizard-prev]').forEach((b) =>
            b.addEventListener('click', () => { if (cur > 0) { cur--; render(); } }));
        render();
    });

    // ---- Repeater: tambah/hapus baris form dinamis dari <template> ----
    document.querySelectorAll('[data-repeater]').forEach((rep) => {
        const list = rep.querySelector('[data-repeater-list]');
        const tpl = rep.querySelector('template[data-repeater-template]');
        rep.querySelectorAll('[data-repeater-add]').forEach((btn) =>
            btn.addEventListener('click', () => {
                const node = tpl?.content.firstElementChild?.cloneNode(true);
                if (node && list) list.appendChild(node);
            }));
        list?.addEventListener('click', (e) => {
            const rm = e.target.closest('[data-repeater-remove]');
            if (rm) rm.closest('[data-repeater-item]')?.remove();
        });
    });

    // ---- DataTable ringan: cari + urut kolom + paginate (sisi-klien) ----
    document.querySelectorAll('[data-datatable]').forEach((root) => {
        const table = root.querySelector('table');
        const tbody = table?.querySelector('tbody');
        if (!table || !tbody) return;
        const search = root.querySelector('[data-datatable-search]');
        const pager = root.querySelector('[data-datatable-pager]');
        const pageSize = parseInt(root.dataset.pageSize || '0', 10);
        const rows = [...tbody.querySelectorAll('tr')];
        const headers = [...table.querySelectorAll('th[data-sort]')];
        const cell = (row, i) => row.children[i]?.textContent.trim() ?? '';
        let page = 1, sortCol = -1, sortDir = 1;

        const apply = () => {
            const q = (search?.value || '').toLowerCase();
            let view = rows.filter((r) => !q || r.textContent.toLowerCase().includes(q));
            if (sortCol >= 0) {
                const type = headers.find((h) => h.cellIndex === sortCol)?.dataset.sort || 'text';
                view = [...view].sort((a, b) => {
                    let av = cell(a, sortCol), bv = cell(b, sortCol);
                    if (type === 'number') {
                        av = parseFloat(av.replace(/[^0-9.-]/g, '')) || 0;
                        bv = parseFloat(bv.replace(/[^0-9.-]/g, '')) || 0;
                    }
                    return (av > bv ? 1 : av < bv ? -1 : 0) * sortDir;
                });
            }
            const pages = pageSize > 0 ? Math.max(1, Math.ceil(view.length / pageSize)) : 1;
            if (page > pages) page = pages;
            rows.forEach((r) => { r.style.display = 'none'; });
            const start = pageSize > 0 ? (page - 1) * pageSize : 0;
            const end = pageSize > 0 ? start + pageSize : view.length;
            view.slice(start, end).forEach((r) => { r.style.display = ''; });
            // urutkan ulang DOM agar sort terlihat
            view.forEach((r) => tbody.appendChild(r));
            if (pager && pageSize > 0) {
                pager.innerHTML = '';
                for (let p = 1; p <= pages; p++) {
                    const a = document.createElement('button');
                    a.type = 'button';
                    a.className = 'page-link' + (p === page ? ' active' : '');
                    a.textContent = String(p);
                    a.addEventListener('click', () => { page = p; apply(); });
                    pager.appendChild(a);
                }
            }
        };

        headers.forEach((h) => h.addEventListener('click', () => {
            const idx = h.cellIndex;
            if (sortCol === idx) sortDir *= -1; else { sortCol = idx; sortDir = 1; }
            headers.forEach((o) => o.classList.remove('sort-asc', 'sort-desc'));
            h.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
            apply();
        }));
        search?.addEventListener('input', () => { page = 1; apply(); });
        apply();
    });

    // ---- Dropzone: pilih/drag banyak file, daftar bisa dihapus ----
    document.querySelectorAll('[data-dropzone]').forEach((dz) => {
        const zone = dz.querySelector('.dropzone');
        const input = dz.querySelector('input[type="file"]');
        const list = dz.querySelector('[data-dropzone-list]');
        if (!zone || !input) return;
        const files = [];
        const fmt = (n) => n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;
        const render = () => {
            if (!list) return;
            list.innerHTML = '';
            files.forEach((f, i) => {
                const row = document.createElement('div');
                row.className = 'dropzone-file';
                const icon = document.createElement('i');
                icon.className = 'ti ti-file';
                const name = document.createElement('span');
                name.className = 'grow truncate';
                name.textContent = f.name;
                const size = document.createElement('span');
                size.className = 'text-muted-foreground';
                size.textContent = fmt(f.size);
                const rm = document.createElement('button');
                rm.type = 'button';
                rm.setAttribute('aria-label', 'Hapus');
                rm.innerHTML = '<i class="ti ti-x"></i>';
                rm.addEventListener('click', () => { files.splice(i, 1); render(); });
                row.append(icon, name, size, rm);
                list.appendChild(row);
            });
        };
        const add = (fileList) => { [...fileList].forEach((f) => files.push(f)); render(); };
        zone.addEventListener('click', () => input.click());
        input.addEventListener('change', () => add(input.files));
        ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('dragover'); }));
        ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove('dragover'); }));
        zone.addEventListener('drop', (e) => { if (e.dataTransfer?.files) add(e.dataTransfer.files); });
    });
});

// ---- BlockUI: window.specaBlock(selector|el, show, teks) — container harus position:relative ----
window.specaBlock = (target, show = true, text = 'Memuat...') => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    el.querySelector(':scope > .blockui-overlay')?.remove();
    if (show) {
        const overlay = document.createElement('div');
        overlay.className = 'blockui-overlay';
        overlay.innerHTML = `<span class="spinner text-primary"></span><span>${text}</span>`;
        el.appendChild(overlay);
    }
};

// ---- Toast: window.specaToast(pesan, variant, timeoutMs) ----
window.specaToast = (message, variant = 'primary', timeoutMs = 4000) => {
    let container = document.getElementById('toast_container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast_container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${variant}`;
    toast.setAttribute('role', 'status');

    const text = document.createElement('div');
    text.className = 'grow';
    text.textContent = message;

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-icon -me-1 size-6';
    close.innerHTML = '<i class="ti ti-x text-sm"></i>';
    close.addEventListener('click', () => toast.remove());

    toast.append(text, close);
    container.appendChild(toast);

    if (timeoutMs > 0) setTimeout(() => toast.remove(), timeoutMs);
};

// ---- Image input preview (event delegation agar bekerja di semua halaman) ----
document.addEventListener('change', function (e) {
    const input = e.target;
    if (!input.matches('.image-input input[type="file"]')) return;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const img = input.closest('.image-input')?.querySelector('img');
        if (img && ev.target?.result) img.src = String(ev.target.result);
    };
    reader.readAsDataURL(file);
});
