import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import inject from '@rollup/plugin-inject';
import { glob } from 'glob';
import path from 'path';
import child_process from 'child_process';
import fs from 'fs';

function normalize(p: string) {
    return p.replace(/\\/g, '/');
}

type KeyBuilder = (m: RegExpMatchArray | null) => string | null;

function getEntryPoints(pattern: string, regex: RegExp, keyBuilder: KeyBuilder) {
    const files = glob.sync(pattern, { ignore: ['**/node_modules/**'] });
    const entries = files.map((filePath) => {
        const normalizedPath = normalize(filePath);
        const fileName = path.basename(normalizedPath);
        if (fileName.startsWith('_')) return null;
        const match = normalizedPath.match(regex);
        if (!match) return null;
        const key = keyBuilder(match);
        if (!key) return null;
        return [key, path.resolve(__dirname, filePath)] as [string, string];
    }).filter((entry): entry is [string, string] => entry !== null);

    return Object.fromEntries(entries);
}

const getThemes = getEntryPoints(
    '{Apps,Libs}/**/Assets/Themes/**/*.{jsx,tsx,js,ts,css,scss}',
    /(Apps|Libs)\/([^/]+)\/Assets\/Themes\/(?:([^/]+)\/)?(?:app\/)?(?:(.*)\/)?([^/.]+)\.(?:jsx|tsx|js|ts|css|scss)$/i,
    (m) => {
        if (!m) return null;

        const themeFolder = m[3] ? m[3].toLowerCase() : '';
        const folderCategory = m[4] ? m[4].toLowerCase() : ''; // widgets, pages, layouts, components, dll
        const fileName = m[5].toLowerCase();    // Nama file asli

        const isMainFile = (themeFolder !== '' && fileName === themeFolder) ||
            fileName === 'index' ||
            fileName === 'style' ||
            fileName === 'theme';

        // Susun key dari bagian NON-KOSONG. Template tailwind-only → file tema kini
        // langsung di Assets/Themes/ tanpa subfolder, jadi themeFolder bisa kosong;
        // filter(Boolean) mencegah '//' atau '/' menggantung pada key.
        const parts = ['themes', themeFolder, folderCategory];
        if (!isMainFile) parts.push(fileName);
        return parts.filter(Boolean).join('/');
    }
);

const getEntries = getEntryPoints(
    '{Apps,Libs}/**/Assets/Entries/**/*.{jsx,tsx,js,ts}',
    /(Apps|Libs)\/([^/]+)\/Assets\/Entries\/(?:([^/]+)\/)?(?:app\/)?(?:(.*)\/)?([^/.]+)\.(?:jsx|tsx|js|ts)$/i,
    (m) => {
        if (!m) return null;

        const category = m[1].toLowerCase(); // Apps atau Libs
        const project = m[2].toLowerCase().replace(/\./g, '-'); // Contoh: portal
        const entryFolder = m[3] ? m[3].toLowerCase() : ''; // entry-folder di dalam Entries
        const subAppFolder = m[4] ? m[4].toLowerCase() : ''; // Menangkap apa didalam app folder
        const fileName = m[5].toLowerCase();    // Nama file asli

        let entryPath = entryFolder ? `${entryFolder}/` : '';
        const subAppPath = subAppFolder ? `${subAppFolder}/` : '';

        entryPath = `${entryPath}${subAppPath}`;

        const isMainFile =
            fileName === entryFolder ||
            fileName === 'index' ||
            fileName === 'main' ||
            fileName === 'core'

        if (isMainFile) return `${category}/${project}/${entryPath}`.replace(/\/$/, '');
        if (entryPath == '') return `${category}/${project}/${fileName}`;
        // entryPath sudah berakhiran '/', jadi JANGAN tambah '/' lagi (mencegah '//'
        // pada Entries bertingkat seperti Entries/layouts/vertical.js).
        return `${category}/${project}/${entryPath}${fileName}`;

    }
);

const getVendors = getEntryPoints(
    '{Apps,Libs}/**/Assets/Vendors/**/*.{jsx,tsx,js,ts,css,scss}',
    /(Apps|Libs)\/([^/]+)\/Assets\/Vendors\/(?:(.*)\/)?([^/.]+)\.(?:jsx|tsx|js|ts|css|scss)$/i,
    (m) => {
        if (!m) return null;

        const vendorFolder = m[3].toLowerCase(); // Nama folder vendor
        const fileName = m[4].toLowerCase();    // Nama file asli

        const isMainFile = fileName === vendorFolder ||
            fileName === 'index' ||
            fileName === 'style'

        if (isMainFile) {
            return `vendors/${vendorFolder}`.replace(/\/$/, '');
        }

        return `vendors/${vendorFolder}/${fileName}`;
    }
);

const entryPoint = {
    ...getThemes,
    ...getEntries,
    ...getVendors,
}

// ---------------------------------------------------------------------------
// Multi-app: target app dipilih lewat env SPECA_APP (default: Portal).
// `pnpm build` (scripts/build-apps.mjs) membangun semua app di Apps/*.
// ---------------------------------------------------------------------------
const appName = process.env.SPECA_APP || 'Portal';
const webAppPath = path.join(__dirname, 'Apps', appName);

if (!fs.existsSync(webAppPath)) {
    console.error(`Error: folder app '${appName}' tidak ditemukan di Apps/.`);
    console.error(`Set env SPECA_APP ke salah satu: ${fs.readdirSync(path.join(__dirname, 'Apps')).join(', ')}`);
    process.exit(1);
}

const appsettingsPath = path.join(webAppPath, 'appsettings.json');
let appsettings;
try {
    appsettings = JSON.parse(fs.readFileSync(appsettingsPath, 'utf-8'));
} catch (error) {
    console.error(`Error: ${appsettingsPath} tidak ditemukan atau tidak valid.`);
    console.error("Pastikan file ada dan terformat dengan benar.");
    process.exit(1);
}

const config = appsettings.Application;

// Sertifikat dev HTTPS hanya dibutuhkan oleh dev server (command 'serve').
// Saat 'build' (termasuk CI tanpa dev-certs) blok ini dilewati.
function loadDevCerts() {
    const certPath = path.join(__dirname, 'certs');
    const certificateName = config.name;
    const certFilePath = path.join(certPath, `${certificateName}.pem`);
    const keyFilePath = path.join(certPath, `${certificateName}.key`);

    if (!fs.existsSync(certPath)) {
        fs.mkdirSync(certPath, { recursive: true });
    }

    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        if (0 !== child_process.spawnSync('dotnet', [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
        ], { stdio: 'inherit', }).status) {
            throw new Error("Could not create certificate.");
        }
    }

    return {
        key: fs.readFileSync(keyFilePath),
        cert: fs.readFileSync(certFilePath),
    };
}

export default defineConfig(({ command }) => ({
    plugins: [
        react(),
        tailwindcss(),
        // Sediakan jQuery untuk plugin LEGACY (yang kita vendor sendiri) yang
        // merujuk global `$`/`jQuery` tanpa import. Inject menyisipkan
        // `import $ from 'jquery'` di mana pun `$`/`jQuery` muncul sebagai
        // variabel bebas. Berkat pnpm.overrides + dedupe, semua memakai SATU jQuery.
        //
        // exclude node_modules — DIBUKTIKAN terukur (2026-06-13): tanpa ini, inject
        // menyeret jQuery (~78KB) ke chunk flatpickr. Sebab flatpickr punya integrasi
        // jQuery OPSIONAL (`if (typeof jQuery !== 'undefined') jQuery.fn.flatpickr…`);
        // inject melihat `jQuery.fn` sebagai var bebas lalu mengubah deteksi-fitur itu
        // jadi import KERAS, memaksa tiap halaman flatpickr memuat jQuery sia-sia.
        // Membatasi inject ke kode kita sendiri membunuh kebocoran tanpa mengorbankan
        // safety-net untuk plugin lawas yang benar-benar kita tulis di Assets/Vendors.
        // exclude juga *.css/*.scss — inject hanya relevan untuk JS/TS; tanpa ini
        // ia mencoba mem-parse CSS sebagai JS dan memuntahkan warning (terukur 2026-06-13
        // saat CSS override vendor di-import dari index.js vendor).
        inject({ $: 'jquery', jQuery: 'jquery', exclude: ['**/node_modules/**', '**/*.css', '**/*.scss'] }),
    ],
    base: '/dist/',
    // Blok server HANYA aktif saat `command==='serve'` (dev). `cors:true` di sini
    // adalah sumber `Access-Control-Allow-Origin: *` yang dilihat ZAP — itu murni
    // dev server Vite (HMR), TIDAK pernah ikut ke build/produksi.
    server: command !== 'serve' ? undefined : {
        strictPort: true,
        host: "localhost",
        cors: true,
        hmr: {
            protocol: 'wss',
            port: config.vite.server.port,
        },
        https: loadDevCerts(),
    },
    define: {
        'process.env': {}
    },
    resolve: {
        // Dedupe jQuery ke SATU instance — cegah >1 salinan saat beberapa vendor
        // (DataTables + plugin jQuery lain) ada di halaman yang sama. Versi tunggal
        // dipaksa via pnpm.overrides (root package.json); dedupe menjaga resolusi.
        dedupe: ['jquery'],
        alias: {
            '@app': path.resolve(webAppPath, 'Assets'),
            '@ui': path.resolve(__dirname, './Libs/UI/Assets')
        }
    },
    build: {
        outDir: path.join(webAppPath, "wwwroot", "dist"),
        emptyOutDir: true,
        // HARDENING PRODUKSI (terukur, diverifikasi di dist setelah build):
        // - sourcemap:false → tidak ada `//# sourceMappingURL=` publik & tidak ada
        //   .map yang membocorkan path lokal (mis. D:/PROJECTS/...) atau source asli.
        // - React Fast Refresh & HMR Vite hanya disuntik pada dev (command==='serve'),
        //   tidak pernah ikut ke output `vite build`.
        // - `import.meta.env.DEV` di-statis-replace jadi `false` saat build produksi,
        //   lalu di-dead-code-eliminate minifier (esbuild default).
        sourcemap: false,
        // manifest.json = satu-satunya sumber kebenaran nama file produksi;
        // tag helper <vite-entry src="..."> me-resolve lewat file ini.
        // Ditulis ke dist/manifest.json (bukan default .vite/) karena Web SDK
        // meng-exclude dot-folder dari publish.
        manifest: 'manifest.json',
        rolldownOptions: {
            input: entryPoint,
            output: {
                // Hash di nama file = cache busting; tidak perlu query ?v= lagi.
                entryFileNames: 'js/[name]-[hash].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: (asset) => {
                    const name = asset.name;
                    if (!name) return 'assets/[name]-[hash][extname]';
                    else if (/\.(gif|jpe?g|png|svg)$/.test(name)) return 'assets/images/[name]-[hash][extname]';
                    else if (/\.(ttf|woff2?)$/.test(name)) return 'assets/fonts/[name]-[hash][extname]';
                    else if (/\.css$/.test(name)) return 'css/[name]-[hash][extname]';
                    return 'assets/[name]-[hash][extname]';
                },
                codeSplitting: {
                    minSize: 20000,
                    // CATATAN PENTING — kenapa TIDAK ada grup per-vendor di sini:
                    //
                    // Tiap vendor (apexcharts, quill, flatpickr, dst.) adalah entry-point
                    // TERPISAH. Rolldown sudah tahu seluruh graf import, jadi code-splitting
                    // otomatis berbasis-entry sudah:
                    //   • mengisolasi tiap vendor (halaman apexcharts tak menyeret quill),
                    //   • mengekstrak dep yang dipakai BERSAMA jadi shared-chunk (tanpa
                    //     duplikasi modul) dan men-share-nya antar entry.
                    //
                    // Pendekatan lama (regex per-paket: quill|parchment|lodash-es|…) ditolak
                    // karena RAPUH: test dicocokkan ke path modul, bukan ke siapa peng-import.
                    // Begitu sebuah sub-dep (mis. lodash, eventemitter3) dipakai library lain,
                    // ia salah-rute — terperangkap di chunk vendor, memaksa halaman tak terkait
                    // memuat vendor itu utuh. Sudah dibuktikan empiris & dibuang.
                    //
                    // Grup react DIPERTAHANKAN: react sengaja dibagi oleh semua entry SPA,
                    // jadi kita beri nama chunk stabil demi caching — ini penamaan framework,
                    // BUKAN enumerasi sub-dep untuk isolasi.
                    groups: [
                        {
                            name: 'libs/react',
                            test: /node_modules[\\/]react/,
                            priority: 22,
                        },
                        {
                            name: 'libs/react-dom',
                            test: /node_modules[\\/]react-dom/,
                            priority: 21,
                        },
                    ],
                }
            }
        }
    }
}));
