import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
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
        const folderCategory = m[4] ? m[4].toLowerCase() : ''; // Menangkap apa pun: widgets, pages, layouts, components, dll
        const fileName = m[5].toLowerCase();    // Nama file asli
        let entryPath = themeFolder ? `${themeFolder}/` : '';
        const categoryPath = folderCategory ? `${folderCategory}/` : '';

        entryPath = `${entryPath}${categoryPath}`;

        const isMainFile = fileName === themeFolder ||
            fileName === 'index' ||
            fileName === 'style' ||
            fileName === 'theme'

        if (isMainFile) {
            return `themes/${themeFolder}/${folderCategory}`.replace(/\/$/, '');
        }

        return `themes/${themeFolder}/${categoryPath}${fileName}`;
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
        return `${category}/${project}/${entryPath}/${fileName}`;

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
    plugins: [react(), tailwindcss()],
    base: '/dist/',
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
    css: {
        preprocessorOptions: {
            scss: {
                // Theme bootstrap: bare import "bootstrap/scss/..." dari node_modules
                loadPaths: ['node_modules'],
                // Bootstrap 5.x masih pakai sintaks @import legacy — bukan kode kita, jangan banjiri log
                quietDeps: true,
                silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
            },
        },
    },
    resolve: {
        alias: {
            '@app': path.resolve(webAppPath, 'Assets'),
            '@ui': path.resolve(__dirname, './Libs/UI/Assets')
        }
    },
    build: {
        outDir: path.join(webAppPath, "wwwroot", "dist"),
        emptyOutDir: true,
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
                        {
                            name: 'libs/popperjs',
                            test: /node_modules[\\/]@popperjs\/core/,
                            priority: 20,
                        },
                        {
                            name: 'libs/bootstrap',
                            test: /node_modules[\\/]bootstrap/,
                            priority: 19,
                        },
                        {
                            name: 'libs/vendor',
                            test: /node_modules/,
                            priority: 10,
                        }
                    ],
                }
            }
        }
    }
}));
