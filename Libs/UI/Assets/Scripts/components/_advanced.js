// Range slider, OTP/PIN, wizard/stepper, repeater.
export function initFormAdvanced() {
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
}
