using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Speca.Core.Extensions
{
    /// <summary>
    /// Security headers + Content-Security-Policy sadar-environment.
    ///
    /// Produksi : CSP ketat — TANPA 'unsafe-eval'. Bundle produksi tidak memakai
    ///            eval/new Function, jadi tidak ada yang rusak; ini menutup vektor
    ///            injeksi skrip via eval (persis yang diingatkan DevTools).
    /// Development: Vite dev server (HMR + React Fast Refresh) sah memakai eval untuk
    ///            hot-reload, jadi 'unsafe-eval' + websocket diizinkan KHUSUS di dev.
    ///
    /// Catatan kejujuran: script-src masih memuat 'unsafe-inline' karena layout
    /// memakai skrip inline kecil (anti-FOUC tema) dan beberapa handler onclick.
    /// Peningkatan berikutnya (opsional): ganti ke skema nonce per-request dan
    /// hapus 'unsafe-inline'. 'unsafe-eval' — yang jadi inti peringatan — sudah
    /// dihapus di produksi.
    /// </summary>
    public static class SecurityHeadersExtensions
    {
        public static IApplicationBuilder UseSpecaSecurityHeaders(this IApplicationBuilder app, IHostEnvironment env)
        {
            var isDev = env.IsDevelopment();

            // connect-src: di dev butuh websocket HMR Vite (wss/ws ke localhost port apa pun).
            var connectSrc = isDev
                ? "connect-src 'self' ws://localhost:* wss://localhost:* http://localhost:* https://localhost:*"
                : "connect-src 'self'";

            // script-src: 'unsafe-eval' HANYA di dev (HMR). Produksi tanpa eval.
            var scriptSrc = isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'";

            var csp = string.Join("; ",
                "default-src 'self'",
                scriptSrc,
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com data:",
                "img-src 'self' data: https:",
                connectSrc,
                "object-src 'none'",
                "base-uri 'self'",
                "frame-ancestors 'self'");

            app.Use(async (context, next) =>
            {
                var headers = context.Response.Headers;
                headers["Content-Security-Policy"] = csp;
                headers["X-Content-Type-Options"] = "nosniff";
                headers["X-Frame-Options"] = "SAMEORIGIN";
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                await next();
            });

            return app;
        }
    }
}
