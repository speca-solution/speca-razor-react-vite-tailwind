/*
 * speca-validation — engine validasi form milik sendiri, tanpa dependensi.
 * Terinspirasi FormValidation.io (live validation, field status, async, extensible),
 * tapi satu sumber kebenaran tetap DataAnnotations: engine membaca atribut
 * data-val-* yang dirender server (paritas adapter ASP.NET).
 *
 * Pakai:  <vite-asset src="Libs/UI/Assets/Entries/validation.js" />  (via partial _ValidationScripts)
 * API  :  window.specaValidation.addValidator(nama, fn(value, el, params) => bool|Promise<bool>)
 *         window.specaValidation.validateForm(form) / validateField(el) / rescan(form)
 *
 * Perilaku: validasi saat blur; setelah field pernah invalid → revalidasi saat mengetik;
 * submit dicegat sampai semua valid (termasuk async), fokus ke error pertama.
 */

const validators = new Map();

const luhn = (raw) => {
    const digits = raw.replace(/[\s-]/g, '');
    if (!/^\d{12,19}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
        let d = +digits[digits.length - 1 - i];
        if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
        sum += d;
    }
    return sum % 10 === 0;
};

// "*.Password" → "Form.Password" (prefix diambil dari nama field saat ini)
const resolveOther = (other, fieldName) => {
    const prefix = fieldName.includes('.') ? fieldName.slice(0, fieldName.lastIndexOf('.') + 1) : '';
    return other.replace(/^\*\./, prefix);
};

// ---- Validator bawaan: paritas atribut data-val-* ASP.NET ----
validators.set('required', (v, el) =>
    el.type === 'checkbox' ? el.checked : v.trim().length > 0);
validators.set('email', (v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
validators.set('url', (v) => v === '' || /^https?:\/\/\S+$/i.test(v));
validators.set('phone', (v) => v === '' || /^[+\d][\d\s().-]{5,}$/.test(v));
validators.set('length', (v, el, p) => {
    if (v === '') return true;
    if (p.min && v.length < +p.min) return false;
    if (p.max && v.length > +p.max) return false;
    return true;
});
validators.set('minlength', (v, el, p) => v === '' || v.length >= +p.min);
validators.set('maxlength', (v, el, p) => v.length <= +p.max);
validators.set('range', (v, el, p) => {
    if (v === '') return true;
    const n = parseFloat(v);
    if (Number.isNaN(n)) return false;
    if (p.min !== undefined && n < +p.min) return false;
    if (p.max !== undefined && n > +p.max) return false;
    return true;
});
validators.set('regex', (v, el, p) => v === '' || new RegExp(p.pattern).test(v));
validators.set('equalto', (v, el, p) => {
    if (v === '') return true;
    const otherName = resolveOther(p.other || '', el.name);
    const other = el.form?.elements.namedItem(otherName);
    return !other || v === other.value;
});
validators.set('creditcard', (v) => v === '' || luhn(v));
// [PageRemote]/[Remote] — async via fetch
validators.set('remote', async (v, el, p) => {
    if (v === '') return true;
    const url = new URL(p.url, location.origin);
    url.searchParams.set(el.name, v);
    (p.additionalfields || '').split(',').map((f) => f.trim()).filter(Boolean).forEach((f) => {
        const name = resolveOther(f, el.name);
        const field = el.form?.elements.namedItem(name);
        if (field) url.searchParams.set(name, field.value);
    });
    const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    const data = await res.json();
    return data === true || data === 'true';
});

const getValue = (el) => {
    if (el.type === 'checkbox') return el.checked ? 'true' : '';
    if (el.type === 'radio') {
        const group = el.form?.elements.namedItem(el.name);
        return group?.value ?? '';
    }
    return el.value;
};

// Ambil aturan dari atribut: data-val-<nama> = pesan, data-val-<nama>-<param> = parameter
const getRules = (el) => {
    const rules = [];
    for (const attr of el.attributes) {
        const m = attr.name.match(/^data-val-([a-z]+)$/);
        if (!m || !validators.has(m[1])) continue;
        const params = {};
        const prefix = `data-val-${m[1]}-`;
        for (const a of el.attributes) {
            if (a.name.startsWith(prefix)) params[a.name.slice(prefix.length)] = a.value;
        }
        rules.push({ name: m[1], message: attr.value || 'Input tidak valid.', params });
    }
    return rules;
};

const setState = (el, ok, message) => {
    el.classList.toggle('input-validation-error', !ok);
    el.classList.toggle('input-validation-success', ok && el.dataset.specaTouched === '1');
    const span = el.form?.querySelector(`[data-valmsg-for="${CSS.escape(el.name)}"]`);
    if (span) {
        span.textContent = ok ? '' : message;
        span.classList.toggle('field-validation-error', !ok);
        span.classList.toggle('field-validation-valid', ok);
    }
};

const validateField = async (el) => {
    const value = getValue(el);
    for (const rule of getRules(el)) {
        const ok = await validators.get(rule.name)(value, el, rule.params);
        if (!ok) {
            el.dataset.specaTouched = '1';
            setState(el, false, rule.message);
            return false;
        }
    }
    el.dataset.specaTouched = '1';
    setState(el, true, '');
    return true;
};

const fieldsOf = (form) => [...form.querySelectorAll('[data-val="true"]')];

const validateForm = async (form) => {
    const results = await Promise.all(fieldsOf(form).map(validateField));
    return results.every(Boolean);
};

const bindForm = (form) => {
    if (form.dataset.specaValidationBound === '1' || fieldsOf(form).length === 0) return;
    form.dataset.specaValidationBound = '1';
    form.setAttribute('novalidate', '');

    form.addEventListener('focusout', (event) => {
        if (event.target.matches?.('[data-val="true"]')) validateField(event.target);
    });
    // setelah pernah invalid → live saat mengetik
    form.addEventListener('input', (event) => {
        const el = event.target;
        if (el.matches?.('[data-val="true"]') && el.dataset.specaTouched === '1') validateField(el);
    });

    form.addEventListener('submit', async (event) => {
        if (form.dataset.specaSubmitting === '1') return; // sudah tervalidasi, biarkan lewat
        event.preventDefault();
        const ok = await validateForm(form);
        if (ok) {
            form.dataset.specaSubmitting = '1';
            form.requestSubmit(event.submitter); // pertahankan name/value tombol (asp-page-handler)
        } else {
            form.querySelector('.input-validation-error')?.focus();
        }
    });
};

const rescan = (root = document) => root.querySelectorAll('form').forEach(bindForm);

document.addEventListener('DOMContentLoaded', () => rescan());

window.specaValidation = {
    addValidator: (name, fn) => validators.set(name, fn),
    validateField,
    validateForm,
    rescan,
};
