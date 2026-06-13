using System.Security.Cryptography;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Speca.Core.Extensions
{
    /// <summary>
    /// Security headers + Content-Security-Policy sadar-environment.
    ///
    /// PRODUKSI — script-src KETAT: 'self' + 'nonce-{acak per-request}'. TANPA
    ///   'unsafe-eval' (bundle produksi tak memakai eval/new Function) dan TANPA
    ///   'unsafe-inline' (tiap skrip inline yang sah — hanya anti-FOUC tema di layout —
    ///   mengusung nonce; handler onclick sudah direfaktor ke listener delegatif).
    ///   Catatan CSP: begitu ada sumber nonce, browser MENGABAIKAN 'unsafe-inline',
    ///   jadi skrip inline tanpa nonce yang benar akan diblokir — itulah tujuannya.
    /// DEVELOPMENT — Vite dev server (HMR + React Fast Refresh) sah memakai eval &
    ///   menyuntik skrip inline tanpa nonce, jadi 'unsafe-inline' 'unsafe-eval' +
    ///   websocket localhost diizinkan KHUSUS di dev (tidak pernah ikut ke produksi).
    ///
    /// style-src TETAP memuat 'unsafe-inline' secara sadar: vendor UI (ApexCharts,
    /// Quill, flatpickr, Tom Select, Pickr, Grid.js) menyuntik atribut style=""
    /// saat runtime; atribut style TIDAK bisa di-nonce/hash, jadi menghapusnya akan
    /// merusak chart/editor/datepicker. Risiko injeksi-style jauh lebih rendah dari
    /// injeksi-skrip — yang sudah ditutup penuh di script-src.
    /// </summary>
    public static class SecurityHeadersExtensions
    {
        /// <summary>Kunci HttpContext.Items tempat nonce CSP per-request disimpan (dipakai layout).</summary>
        public const string NonceItemKey = "csp-nonce";

        public static IApplicationBuilder UseSpecaSecurityHeaders(this IApplicationBuilder app, IHostEnvironment env)
        {
            var isDev = env.IsDevelopment();

            app.Use(async (context, next) =>
            {
                // Nonce per-request HANYA di produksi (basis acak 128-bit). Disimpan di
                // HttpContext.Items agar layout menempelkannya ke <script> inline.
                string scriptSrc;
                if (isDev)
                {
                    scriptSrc = "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
                }
                else
                {
                    var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
                    context.Items[NonceItemKey] = nonce;
                    scriptSrc = $"script-src 'self' 'nonce-{nonce}'";
                }

                // connect-src: dev butuh websocket HMR Vite ke localhost (port apa pun).
                var connectSrc = isDev
                    ? "connect-src 'self' ws://localhost:* wss://localhost:* http://localhost:* https://localhost:*"
                    : "connect-src 'self'";

                var csp = string.Join("; ",
                    "default-src 'self'",
                    scriptSrc,
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                    "font-src 'self' https://fonts.gstatic.com data:",
                    "img-src 'self' data: https:",
                    connectSrc,
                    "object-src 'none'",
                    "base-uri 'self'",
                    "form-action 'self'",
                    "frame-ancestors 'self'");

                var headers = context.Response.Headers;
                headers["Content-Security-Policy"] = csp;
                headers["X-Content-Type-Options"] = "nosniff";
                headers["X-Frame-Options"] = "SAMEORIGIN";
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                // Matikan API browser sensitif yang tak dipakai → perkecil permukaan serangan.
                headers["Permissions-Policy"] =
                    "accelerometer=(), autoplay=(), camera=(), display-capture=(), " +
                    "encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), " +
                    "microphone=(), midi=(), payment=(), usb=()";
                // Isolasi lintas-asal (cegah halaman lain mereferensi window kita / mencuri resource).
                headers["Cross-Origin-Opener-Policy"] = "same-origin";
                headers["Cross-Origin-Resource-Policy"] = "same-origin";

                await next();
            });

            return app;
        }
    }
}
