import { Code, ConnectError, createClient, type Interceptor } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GreeterService } from '@app/gen/greeter_pb';

// Interceptor KLIEN: sisipkan token auth ke SETIAP panggilan (di app nyata: JWT/
// cookie session). Server membacanya via metadata `authorization` (lihat
// GreeterRpcService + GrpcLoggingInterceptor).
const authInterceptor: Interceptor = (next) => async (req) => {
    req.header.set('Authorization', 'Bearer demo-token');
    return await next(req);
};

// Transport gRPC-Web same-origin (CSP `connect-src 'self'`). Klien & tipe 100%
// di-generate dari greeter.proto → kontrak typed end-to-end (unary + streaming).
const transport = createGrpcWebTransport({
    baseUrl: window.location.origin,
    interceptors: [authInterceptor],
});
const client = createClient(GreeterService, transport);

function describeError(e: unknown): string {
    // Pemetaan error: status gRPC → pesan UI ramah (mis. InvalidArgument).
    if (e instanceof ConnectError) return `${Code[e.code]}: ${e.message}`;
    return e instanceof Error ? e.message : String(e);
}

function RpcDemo() {
    const [name, setName] = useState('Speca');
    const [reply, setReply] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [ticks, setTicks] = useState<string[]>([]);
    const [streaming, setStreaming] = useState(false);

    async function sayHello() {
        setLoading(true);
        setError(null);
        setReply(null);
        try {
            const res = await client.sayHello({ name });
            setReply(`${res.message}  ·  servedAtUnixMs=${res.servedAtUnixMs}`);
        } catch (e) {
            setError(describeError(e));
        } finally {
            setLoading(false);
        }
    }

    async function streamTicks() {
        setStreaming(true);
        setError(null);
        setTicks([]);
        try {
            // Server-streaming: konsumsi sebagai async-iterable, update live.
            for await (const tick of client.streamTicks({ count: 5 })) {
                setTicks((prev) => [...prev, `#${tick.index} @ ${tick.atUnixMs}`]);
            }
        } catch (e) {
            setError(describeError(e));
        } finally {
            setStreaming(false);
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="card">
                <div className="card-body flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="form-label" htmlFor="rpc-name">Nama (kosongkan untuk memicu error)</label>
                        <input
                            id="rpc-name"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ketik nama…"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <button className="btn btn-primary" onClick={sayHello} disabled={loading}>
                            {loading ? 'Memanggil…' : 'SayHello (unary + auth)'}
                        </button>
                        <button className="btn btn-outline" onClick={streamTicks} disabled={streaming}>
                            {streaming ? 'Streaming…' : 'StreamTicks (server-streaming)'}
                        </button>
                    </div>
                    {reply && (
                        <div className="alert alert-success">
                            <i className="ti ti-circle-check"></i>
                            <span>{reply}</span>
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-danger">
                            <i className="ti ti-alert-triangle"></i>
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {ticks.length > 0 && (
                <div className="card">
                    <div className="card-body">
                        <div className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">Stream</div>
                        <ul className="flex flex-col gap-1 font-mono text-sm">
                            {ticks.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

const el = document.getElementById('rpc-root');
if (el) {
    createRoot(el).render(<RpcDemo />);
}
