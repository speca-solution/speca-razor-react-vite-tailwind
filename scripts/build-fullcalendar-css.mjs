// Ekstrak CSS inti FullCalendar v6 dari paket @fullcalendar → file statis.
//
// KENAPA: FC v6 meng-inject CSS-nya sendiri saat runtime (injectStyles → insertRule).
// Pada build produksi rolldown ini, injeksi itu menghasilkan 0 rule (kalender tampil
// TANPA gaya). Solusi andal & version-pinned: ekstrak string CSS (var css_xxx = "...")
// dari source paket lalu impor sebagai stylesheet biasa di vendor index.js.
//
// Regenerasi setelah upgrade FullCalendar:  node scripts/build-fullcalendar-css.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const files = [
    'node_modules/@fullcalendar/core/internal-common.js',
    'node_modules/@fullcalendar/daygrid/internal.js',
    'node_modules/@fullcalendar/timegrid/internal.js',
    'node_modules/@fullcalendar/list/internal.js',
];

// var css_xxx = "....";  — string literal JS (escape \" \\ \e900 dst).
const re = /var\s+css_\w+\s*=\s*("(?:[^"\\]|\\.)*")/g;

let out =
    '/* FullCalendar v6 — CSS inti DI-EKSTRAK dari paket @fullcalendar (injeksi runtime FC\n' +
    '   tidak andal di build rolldown → 0 rule). JANGAN edit manual.\n' +
    '   Regenerasi: node scripts/build-fullcalendar-css.mjs */\n';

let total = 0;
for (const f of files) {
    let txt;
    try { txt = readFileSync(f, 'utf8'); } catch { console.warn('lewati (tak ada):', f); continue; }
    let m;
    let n = 0;
    re.lastIndex = 0;
    while ((m = re.exec(txt))) {
        const css = Function('return ' + m[1])(); // unescape literal JS string (source tepercaya)
        out += '\n' + css + '\n';
        n++;
        total++;
    }
    console.log(`${f} → ${n} blok CSS`);
}

const dest = 'Libs/UI/Assets/Vendors/fullcalendar/_fullcalendar.css';
writeFileSync(dest, out);
console.log(`\n${total} blok CSS → ${dest} (${(out.length / 1024).toFixed(1)} KB)`);
