// Smoke test produksi: setiap halaman 200 dan semua asset /dist 200.
// Guard regresi: tidak boleh ada asset ber-nama bootstrap (stack dihapus,
// lihat git tag 'with-bootstrap' bila perlu menghidupkan kembali).
// Pakai: node scripts/smoke-test.mjs [baseUrl]   (default http://localhost:5599)
const base = process.argv[2] ?? 'http://localhost:5599';

// Simulasikan produksi di balik reverse-proxy yang terminasi TLS: app menerima HTTP
// lokal tapi X-Forwarded-Proto memberitahu bahwa klien memakai HTTPS. Tanpa ini,
// hardening produksi (antiforgery Cookie.SecurePolicy=Always) menolak menerbitkan
// token di koneksi non-SSL → halaman form 500. UseForwardedHeaders menanganinya.
const headers = { 'X-Forwarded-Proto': 'https' };
const get = (url) => fetch(url, { headers });

const pages = [
    '/', '/Layout2', '/Components', '/Tables', '/Charts', '/Privacy',
    '/Dashboards/Metronic', '/Dashboards/Vuexy', '/ReactDemo',
    '/Account/Login', '/Account/Register', '/Account/ForgotPassword',
    '/Settings', '/StatusCode/404',
];

let failed = false;
const fail = (msg) => { failed = true; console.error(`  FAIL ${msg}`); };

// Guard CSP produksi: header ada & TANPA 'unsafe-eval' (vektor injeksi via eval ditutup).
const csp = (await get(base + '/')).headers.get('content-security-policy');
if (!csp) fail('Header Content-Security-Policy tidak ada');
else if (/unsafe-eval/i.test(csp)) fail(`CSP produksi memuat 'unsafe-eval' (regresi keamanan)`);
else console.log('OK  CSP produksi (tanpa unsafe-eval)');

for (const page of pages) {
    const res = await get(base + page);
    if (res.status !== 200) {
        fail(`${page} => HTTP ${res.status}`);
        continue;
    }

    const html = await res.text();
    const assets = [...html.matchAll(/(?:src|href)="(\/dist\/[^"]+)"/g)].map((m) => m[1]);
    if (assets.length === 0) fail(`${page}: tidak ada asset /dist di HTML`);

    for (const asset of assets) {
        const a = await get(base + asset);
        if (a.status !== 200) fail(`${page}: asset ${asset} => HTTP ${a.status}`);
        if (/bootstrap/i.test(asset)) fail(`${page}: asset bootstrap terdeteksi (regresi): ${asset}`);
    }

    console.log(`OK  ${page} (${assets.length} asset)`);
}

if (failed) {
    console.error('\nSmoke test GAGAL.');
    process.exit(1);
}
console.log('\nSmoke test lulus.');
