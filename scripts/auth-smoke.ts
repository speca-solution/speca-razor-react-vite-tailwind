// Verifikasi keamanan API token (JWT + refresh rotation + reuse detection) — nyata,
// bukan semu. Menegakkan properti keamanan sebagai gerbang CI (dijalankan tiap commit
// saat --auth identity). Butuh user demo yang di-seed (demo@speca.test / Demo!2345).
// Pakai: node scripts/auth-smoke.ts [baseUrl]   (Node 22+; default :5599)
const base = process.argv[2] ?? 'http://localhost:5599';
const EMAIL = 'demo@speca.test';
const PASS = 'Demo!2345';

let failed = 0;
function check(name: string, ok: boolean, detail = '') {
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failed++;
}

type Tokens = { accessToken: string; refreshToken: string };

async function post(path: string, body: unknown, auth?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) headers.Authorization = `Bearer ${auth}`;
    const res = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });
    return res;
}

async function login(password = PASS): Promise<{ status: number; tokens?: Tokens }> {
    const res = await post('/auth/login', { email: EMAIL, password });
    if (res.status !== 200) return { status: res.status };
    return { status: res.status, tokens: (await res.json()) as Tokens };
}

// 1) Enforcement: /auth/me tanpa token → 401.
{
    const res = await fetch(base + '/auth/me');
    check('/auth/me tanpa token → 401', res.status === 401, `got ${res.status}`);
}

// 2) Login sukses → access + refresh token.
const first = await login();
check('login demo → 200 + token', first.status === 200 && !!first.tokens?.accessToken && !!first.tokens?.refreshToken, `status ${first.status}`);
const tokens = first.tokens;
if (!tokens) {
    console.error('  (login gagal — hentikan; pastikan user demo di-seed & rate limit belum terpicu)');
    process.exit(1);
}

// 3) Validasi token: /auth/me dengan token → 200 + sub.
{
    const res = await fetch(base + '/auth/me', { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
    const body = res.ok ? ((await res.json()) as { sub?: string }) : {};
    check('/auth/me dengan token → 200 + sub', res.status === 200 && !!body.sub, `status ${res.status}`);
}

// 4) Password salah → 401 (BUKAN 400 — status asli tak tersamar re-execute HTML).
{
    const res = await post('/auth/login', { email: EMAIL, password: 'salah-sekali' });
    check('login password salah → 401', res.status === 401, `got ${res.status}`);
}

// 5) Refresh (rotasi) → 200 + refresh token BARU yang berbeda.
const rotated = await post('/auth/refresh', { refreshToken: tokens.refreshToken });
const rotatedBody = rotated.ok ? ((await rotated.json()) as Tokens) : undefined;
check('refresh rotasi → 200 + token baru berbeda',
    rotated.status === 200 && !!rotatedBody && rotatedBody.refreshToken !== tokens.refreshToken,
    `status ${rotated.status}`);

// 6) REUSE DETECTION: refresh token LAMA (sudah dirotasi) dipakai lagi → 401.
{
    const res = await post('/auth/refresh', { refreshToken: tokens.refreshToken });
    check('reuse token lama → 401', res.status === 401, `got ${res.status}`);
}

// 7) FAMILY REVOKE: token hasil rotasi ikut dicabut setelah reuse terdeteksi → 401.
if (rotatedBody) {
    const res = await post('/auth/refresh', { refreshToken: rotatedBody.refreshToken });
    check('family revoke (token rotasi ikut mati) → 401', res.status === 401, `got ${res.status}`);
}

// 8) Logout mencabut refresh token → pemakaian berikutnya 401.
{
    const fresh = await login();
    if (fresh.tokens) {
        const out = await post('/auth/logout', { refreshToken: fresh.tokens.refreshToken });
        const after = await post('/auth/refresh', { refreshToken: fresh.tokens.refreshToken });
        check('logout lalu refresh → 204 + 401', out.status === 204 && after.status === 401, `logout ${out.status}, refresh ${after.status}`);
    } else {
        check('logout flow', false, `login ulang gagal (status ${fresh.status})`);
    }
}

if (failed > 0) {
    console.error(`\nAuth-smoke GAGAL: ${failed} asersi keamanan tidak terpenuhi.`);
    process.exit(1);
}
console.log('\nAuth-smoke lulus (enforcement, validasi, rotasi, reuse-detection, family-revoke, logout).');
