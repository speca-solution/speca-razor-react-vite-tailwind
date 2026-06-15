// Verifikasi end-to-end gRPC-Web: panggil server pakai DESKRIPTOR yang SAMA dengan
// yang dipakai browser (Apps/Portal/Assets/gen/greeter_pb.ts). Membuktikan jalur
// proto → C# server → wire gRPC-Web → klien TS round-trip untuk: unary + auth
// metadata, server-streaming, dan pemetaan error.
// Pakai: node scripts/rpc-smoke.ts [baseUrl]   (Node 22+ strip-types; default :5599)
import { Code, ConnectError, createClient, type Interceptor } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { GreeterService } from '../Apps/Portal/Assets/gen/greeter_pb.ts';

const base = process.argv[2] ?? 'http://localhost:5599';

const authInterceptor: Interceptor = (next) => async (req) => {
    req.header.set('Authorization', 'Bearer test-token');
    return await next(req);
};

const transport = createGrpcWebTransport({ baseUrl: base, interceptors: [authInterceptor] });
const client = createClient(GreeterService, transport);

const fail = (msg: string) => {
    console.error(`  FAIL: ${msg}`);
    process.exit(1);
};

// 1) Unary + auth metadata (interceptor menyisipkan Authorization → server echo).
const res = await client.sayHello({ name: 'Speca' });
console.log('  [unary]   ', res.message, '| servedAtUnixMs=', res.servedAtUnixMs);
if (!res.message.includes('Speca')) fail('balasan tidak memuat nama yang dikirim');
if (!res.message.includes('token diterima')) fail('metadata auth tidak sampai ke server');
if (typeof res.servedAtUnixMs !== 'bigint' || res.servedAtUnixMs <= 0n) fail('int64 servedAtUnixMs bukan bigint > 0');

// 2) Server-streaming: harus menerima tepat `count` tick berurutan.
let n = 0;
for await (const tick of client.streamTicks({ count: 4 })) {
    n++;
    if (tick.index !== n) fail(`urutan tick salah: got ${tick.index}, expected ${n}`);
}
console.log('  [stream]   menerima', n, 'tick');
if (n !== 4) fail(`jumlah tick salah: got ${n}, expected 4`);

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
