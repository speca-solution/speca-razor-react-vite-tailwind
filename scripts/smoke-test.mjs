// Smoke test produksi: setiap halaman 200, semua asset /dist 200,
// dan isolasi stack (halaman Tailwind tidak memuat asset Bootstrap, sebaliknya juga).
// Pakai: node scripts/smoke-test.mjs [baseUrl]   (default http://localhost:5599)
const base = process.argv[2] ?? 'http://localhost:5599';

const pages = [
    { path: '/', stack: 'tailwind' },
    { path: '/Layout2', stack: 'bootstrap' },
    { path: '/Layout3', stack: 'tailwind' },
    { path: '/Layout4', stack: 'bootstrap' },
    { path: '/Privacy', stack: 'tailwind' },
];

const stackPatterns = {
    tailwind: /themes\/tailwind|tabler|lucide/,
    bootstrap: /themes\/bootstrap|bootstrap-icons|vendors\/bootstrap-/,
};

let failed = false;
const fail = (msg) => { failed = true; console.error(`  FAIL ${msg}`); };

for (const page of pages) {
    const res = await fetch(base + page.path);
    if (res.status !== 200) {
        fail(`${page.path} => HTTP ${res.status}`);
        continue;
    }

    const html = await res.text();
    const assets = [...html.matchAll(/(?:src|href)="(\/dist\/[^"]+)"/g)].map((m) => m[1]);
    if (assets.length === 0) fail(`${page.path}: tidak ada asset /dist di HTML`);

    for (const asset of assets) {
        const a = await fetch(base + asset);
        if (a.status !== 200) fail(`${page.path}: asset ${asset} => HTTP ${a.status}`);
    }

    const other = page.stack === 'tailwind' ? 'bootstrap' : 'tailwind';
    const crossed = assets.filter((u) => stackPatterns[other].test(u));
    if (crossed.length > 0) fail(`${page.path}: isolasi bocor ke stack ${other}: ${crossed.join(', ')}`);

    console.log(`OK  ${page.path} (${assets.length} asset, stack ${page.stack})`);
}

if (failed) {
    console.error('\nSmoke test GAGAL.');
    process.exit(1);
}
console.log('\nSmoke test lulus.');
