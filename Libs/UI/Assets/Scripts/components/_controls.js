// Kontrol form: stepper, toggle-password, rating.
export function initFormControls() {
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
}
