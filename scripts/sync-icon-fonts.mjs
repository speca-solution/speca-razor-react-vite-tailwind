// Sinkronisasi icon font dari node_modules ke Vendors/ dengan @font-face woff2-only.
// Paket aslinya membawa format legacy (eot/svg/ttf/woff, total puluhan MB di dist);
// browser modern hanya butuh woff2. Jalankan ulang setelah upgrade paket icon:
//   node scripts/sync-icon-fonts.mjs
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ui = path.join(root, 'Libs', 'UI');
const nm = path.join(ui, 'node_modules');
const vendors = path.join(ui, 'Assets', 'Vendors');

const sets = [
    {
        name: 'lucide',
        css: path.join(nm, 'lucide-static', 'font', 'lucide.css'),
        woff2: path.join(nm, 'lucide-static', 'font', 'lucide.woff2'),
        family: 'lucide',
        outCss: '_lucide.css',
        outWoff2: 'lucide.woff2',
    },
    {
        name: 'tabler-icons',
        css: path.join(nm, '@tabler', 'icons-webfont', 'dist', 'tabler-icons.css'),
        woff2: path.join(nm, '@tabler', 'icons-webfont', 'dist', 'fonts', 'tabler-icons.woff2'),
        family: 'tabler-icons',
        outCss: '_tabler-icons.css',
        outWoff2: 'tabler-icons.woff2',
    },
];

for (const set of sets) {
    const outDir = path.join(vendors, set.name);
    const fontDir = path.join(outDir, 'fonts');
    mkdirSync(fontDir, { recursive: true });

    let css = readFileSync(set.css, 'utf-8');

    // Ganti seluruh blok @font-face pertama dengan versi woff2-only.
    const fontFace =
        `@font-face {\n` +
        `  font-family: "${set.family}";\n` +
        `  src: url('./fonts/${set.outWoff2}') format('woff2');\n` +
        `  font-weight: normal;\n` +
        `  font-style: normal;\n` +
        `  font-display: block;\n` +
        `}`;
    const replaced = css.replace(/@font-face\s*\{[^}]*\}/, fontFace);
    if (replaced === css) {
        console.error(`[sync-icon-fonts] @font-face tidak ditemukan di ${set.css}`);
        process.exit(1);
    }

    writeFileSync(path.join(outDir, set.outCss),
        `/* AUTO-GENERATED oleh scripts/sync-icon-fonts.mjs — jangan edit manual. */\n` + replaced);
    copyFileSync(set.woff2, path.join(fontDir, set.outWoff2));
    console.log(`[sync-icon-fonts] ${set.name}: css + woff2 tersinkron.`);
}
