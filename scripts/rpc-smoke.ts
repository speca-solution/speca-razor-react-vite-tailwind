// Verifikasi end-to-end gRPC-Web: panggil server pakai DESKRIPTOR yang SAMA dengan
// yang dipakai browser (Apps/Portal/Assets/gen/greeter_pb.ts). Membuktikan jalur
// proto → C# server → wire gRPC-Web → klien TS round-trip untuk: unary + auth
// metadata, server-streaming, dan pemetaan error.
// Pakai: node scripts/rpc-smoke.ts [baseUrl]   (Node 22+ strip-types; default :5599)
import { Code, ConnectError, createClient, type Interceptor } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { GreeterService } from '../Apps/Portal/Assets/gen/greeter_pb.ts';

const base = process.argv[2] ?? 'http://localhost:5599';

const fail = (msg: string) => {
    console.error(`  FAIL: ${msg}`);
    process.exit(1);
};

// Adaptif terhadap --auth: bila endpoint /auth/login ada (useAuth), ambil access JWT
// nyata dari user demo. Bila tidak (auth none), token tetap null → jalur anonim.
// Ini membuat rpc-smoke valid di KEDUA instance tanpa conditional template.
async function tryGetToken(): Promise<string | null> {
    try {
        const res = await fetch(base + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'demo@speca.test', password: 'Demo!2345' }),
        });
        if (res.status !== 200) return null;
        return ((await res.json()) as { accessToken: string }).accessToken;
    } catch {
        return null;
    }
}

const token = await tryGetToken();
const authEnabled = token !== null;
console.log(`  [auth]     ${authEnabled ? 'aktif — token demo diperoleh' : 'nonaktif (anonim)'}`);

const authInterceptor: Interceptor = (next) => async (req) => {
    req.header.set('Authorization', `Bearer ${token ?? 'test-token'}`);
    return await next(req);
};

const transport = createGrpcWebTransport({ baseUrl: base, interceptors: [authInterceptor] });
const client = createClient(GreeterService, transport);

// Transport TANPA token (untuk uji enforcement StreamTicks saat auth aktif).
const anonTransport = createGrpcWebTransport({ baseUrl: base });
const anonClient = createClient(GreeterService, anonTransport);

// 1) Unary + auth metadata (interceptor menyisipkan Authorization → server echo).
const res = await client.sayHello({ name: 'Speca' });
console.log('  [unary]   ', res.message, '| servedAtUnixMs=', res.servedAtUnixMs);
if (!res.message.includes('Speca')) fail('balasan tidak memuat nama yang dikirim');
if (!res.message.includes('token diterima')) fail('metadata auth tidak sampai ke server');
if (typeof res.servedAtUnixMs !== 'bigint' || res.servedAtUnixMs <= 0n) fail('int64 servedAtUnixMs bukan bigint > 0');

// 2) Server-streaming: harus menerima tepat `count` tick berurutan (klien ber-token).
let n = 0;
for await (const tick of client.streamTicks({ count: 4 })) {
    n++;
    if (tick.index !== n) fail(`urutan tick salah: got ${tick.index}, expected ${n}`);
}
console.log('  [stream]   menerima', n, 'tick');
if (n !== 4) fail(`jumlah tick salah: got ${n}, expected 4`);

// 2b) ENFORCEMENT (hanya saat auth aktif): StreamTicks TANPA token harus DITOLAK
// tanpa membocorkan satu tick pun. Properti keamanan = nol data + call gagal.
// (Kode gRPC-Web bisa Unauthenticated/Internal — 401 [Authorize] tak selalu ter-framing
// sbg status gRPC; yang dijamin: TIDAK ada tick yang lolos ke klien tanpa token.)
if (authEnabled) {
    let leaked = 0;
    let rejected = false;
    try {
        for await (const _ of anonClient.streamTicks({ count: 4 })) {
            leaked++;
        }
    } catch (e) {
        rejected = true;
        const code = e instanceof ConnectError ? Code[e.code] : String(e);
        console.log(`  [authz]    StreamTicks tanpa token → ditolak (${code})`);
    }
    if (leaked > 0) fail(`ENFORCEMENT BOBOL: ${leaked} tick bocor tanpa token`);
    if (!rejected) fail('StreamTicks tanpa token seharusnya ditolak, tapi selesai tanpa error');
}

// 3) Pemetaan error: name kosong → InvalidArgument.
try {
    await client.sayHello({ name: '' });
    fail('seharusnya melempar error untuk nama kosong');
} catch (e) {
    if (!(e instanceof ConnectError) || e.code !== Code.InvalidArgument) {
        fail(`error code salah: ${e instanceof ConnectError ? Code[e.code] : String(e)}`);
    }
    console.log('  [error]    InvalidArgument terpetakan benar:', (e as ConnectError).message);
}

console.log('  gRPC-Web round-trip OK (unary+auth, streaming, error-mapping)');
