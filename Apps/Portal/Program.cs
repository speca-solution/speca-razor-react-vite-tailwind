
using Microsoft.AspNetCore.HttpOverrides;
using Speca.Core.Extensions;
#if (useAuth)
using Speca.Data;
#endif
#if (proto)
using Speca.Portal.Services;
#endif
using Speca.UI.Navigation;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;
var ApplicationConfig = config.GetSection("Application");

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

#if (useAuth)
// ---- Data HYBRID: EF Core (Identity + skema/migrasi) + Dapper (query objects).
// DB default SQLite (ConnectionStrings:Default). Lihat Libs/Data. ----
builder.Services.AddSpecaData(config);
#endif

#if (proto)
// ---- gRPC + gRPC-Web (kontrak di Libs/Contracts/Protos/*.proto) ----
// Server bicara gRPC; gRPC-Web (UseGrpcWeb + EnableGrpcWeb di bawah) membuat
// endpoint yang sama bisa dipanggil dari browser (fetch) same-origin — klien
// TypeScript di-generate Buf dari proto yang sama (lihat buf.gen.yaml).
// Interceptor logging/auth = lintas-cutting untuk SEMUA method (lihat Services/GrpcLoggingInterceptor).
builder.Services.AddGrpc(options =>
{
    options.Interceptors.Add<GrpcLoggingInterceptor>();
});
#endif

// ---- Forwarded headers: deteksi HTTPS & IP-klien yang benar di balik reverse
// proxy yang terminasi TLS (nginx/IIS/ALB/App Service). WAJIB agar Secure-cookie,
// antiforgery (SecurePolicy=Always), dan HTTPS-redirect bekerja saat TLS diterminasi
// di proxy (Kestrel menerima HTTP). KnownNetworks/Proxies dikosongkan = percaya
// X-Forwarded-* dari upstream → app HARUS hanya dijangkau lewat proxy tepercaya
// (jangan ekspos Kestrel langsung ke internet). Untuk membatasi, isi KnownProxies
// dengan IP proxy yang tetap.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// ---- CORS (didorong konfigurasi) ----
// Razor server-rendered tak butuh CORS untuk halaman sendiri; kebijakan ini
// disiapkan untuk endpoint API / klien lintas-asal. Origin dibaca dari
// "Cors:AllowedOrigins": dev → localhost, prod → domain spesifik
// (lihat appsettings.{Environment}.json). Kosong = tolak semua lintas-asal.
var corsOrigins = config.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("SpecaCors", policy =>
    {
        if (corsOrigins.Length > 0)
        {
            policy.WithOrigins(corsOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        // Tanpa origin terdaftar → default-deny (tak ada header CORS dikirim).
    });
});

// ---- HSTS (dipakai produksi via app.UseHsts) ----
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);   // >= 1 tahun
    options.IncludeSubDomains = true;
    options.Preload = false;                   // true HANYA bila akan didaftarkan ke hstspreload.org
});

// ---- Antiforgery: cookie aman (temuan ZAP: cookie tanpa Secure) ----
builder.Services.AddAntiforgery(options =>
{
    options.Cookie.Name = "speca.antiforgery";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    // Prod: paksa Secure. Dev: ikut skema request agar http lokal tetap jalan.
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
});

// ---- CookiePolicy global: jaring pengaman Secure untuk SEMUA cookie ----
// (mis. cookie auth/sesi yang ditambahkan kemudian otomatis ikut diamankan).
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.Lax;
    options.Secure = builder.Environment.IsDevelopment()
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
});

// Menu sidebar — satu definisi untuk semua theme (renderer ada di Speca.UI)
builder.Services.AddSpecaMenu(menu =>
{
    menu.Items.AddRange(
    [
        // Landing
        new MenuItem
        {
#if (isStarter)
            Title = "Beranda",
#else
            Title = "Preview Tema",
#endif
            Url = "/",
            Icon = "ti ti-home",
            MobilePrimary = true,
            ShortLabel = "Home",
        },

#if (!isStarter)
        // ───────────── 1. Layouts (contoh struktur layout) ─────────────
        new MenuItem { Title = "Layouts", IsHeading = true },
        // Blank TIDAK di-link: layout blank tak punya menu (dead-end); dipakai oleh Auth & Error.
        new MenuItem { Title = "Vertikal (Default)", Url = "/?layout=vertical", Icon = "ti ti-layout-sidebar" },
        new MenuItem { Title = "Horizontal (Topbar)", Url = "/Layout2", Icon = "ti ti-layout-navbar" },
#endif

        // ───────────── 2. Themes (pilihan tema) ─────────────
        new MenuItem { Title = "Themes", IsHeading = true },
#if (useTheme1)
        new MenuItem { Title = "Tema 1 — Metronic", Url = "/Dashboards/Metronic", Icon = "ti ti-layout-2" },
#endif
#if (useTheme2)
        new MenuItem { Title = "Tema 2 — Vuexy", Url = "/Dashboards/Vuexy", Icon = "ti ti-layout-grid" },
#endif

#if (!isStarter)
        // ───────────── 3. Components (dasar · tambahan · lanjutan) ─────────────
        new MenuItem { Title = "Components", IsHeading = true },
        new MenuItem { Title = "Komponen (Galeri)", Url = "/Components", Icon = "ti ti-components" },
        new MenuItem
        {
            Title = "Tabel Data",
            Url = "/Tables",
            Icon = "ti ti-table",
            MobilePrimary = true,
            ShortLabel = "Tabel",
        },
        new MenuItem
        {
            Title = "Charts",
            Url = "/Charts",
            Icon = "ti ti-chart-line",
            MobilePrimary = true,
            ShortLabel = "Chart",
        },
        new MenuItem { Title = "Form Repeater", Url = "/RepeaterDemo", Icon = "ti ti-list-details" },
        new MenuItem { Title = "Kalender (FullCalendar)", Url = "/Calendar", Icon = "ti ti-calendar-event" },
        new MenuItem { Title = "Widget Lanjutan", Url = "/Advanced", Icon = "ti ti-stack-2" },
#endif

        // ───────────── 4. Apps (contoh aplikasi / fitur kompleks) ─────────────
        new MenuItem { Title = "Apps", IsHeading = true },
#if (!isStarter)
        new MenuItem { Title = "Pengaturan", Url = "/Settings", Icon = "ti ti-settings" },
#endif
#if (useAuth)
        new MenuItem { Title = "Produk (EF + Dapper)", Url = "/Products", Icon = "ti ti-database" },
#endif
#if (!isStarter)
        new MenuItem { Title = "Demo React (Razor↔React)", Url = "/ReactDemo", Icon = "ti ti-brand-react" },
#endif
#if (proto)
        new MenuItem { Title = "Demo gRPC (Proto)", Url = "/RpcDemo", Icon = "ti ti-binary-tree" },
#endif
        new MenuItem
        {
            Title = "Autentikasi",
            Icon = "ti ti-lock-access",
            Children =
            [
                new MenuItem { Title = "Masuk (Login)", Url = "/Account/Login", Icon = "ti ti-login" },
                new MenuItem { Title = "Daftar (Register)", Url = "/Account/Register", Icon = "ti ti-user-plus" },
                new MenuItem { Title = "Lupa Password", Url = "/Account/ForgotPassword", Icon = "ti ti-key" },
            ],
        },
        new MenuItem
        {
            // Halaman utilitas ber-layout blank — sejenis dgn Auth, jadi dikelompokkan di sini.
            Title = "Halaman Error",
            Icon = "ti ti-alert-triangle",
            Children =
            [
                new MenuItem { Title = "Error 404", Url = "/StatusCode/404", Icon = "ti ti-mood-sad" },
                new MenuItem { Title = "Error 500", Url = "/Error", Icon = "ti ti-alert-triangle" },
            ],
        },

#if (!isStarter)
        // ───────────── 5. Lainnya — demo kemampuan komponen MENU (bukan halaman) ─────────────
        new MenuItem { Title = "Lainnya (Demo Menu)", IsHeading = true },
        new MenuItem
        {
            // Demo MULTI-LEVEL: sidebar = accordion; horizontal = flyout ke samping (ala Vuexy).
            Title = "Menu Multi-level",
            Icon = "ti ti-list-tree",
            Children =
            [
                new MenuItem
                {
                    Title = "Elektronik",
                    Icon = "ti ti-device-laptop",
                    Children =
                    [
                        new MenuItem { Title = "Laptop", Url = "#" },
                        new MenuItem { Title = "Smartphone", Url = "#" },
                        new MenuItem
                        {
                            Title = "Aksesoris",
                            Icon = "ti ti-plug",
                            Children =
                            [
                                new MenuItem { Title = "Charger", Url = "#" },
                                new MenuItem { Title = "Casing", Url = "#" },
                                new MenuItem { Title = "Kabel Data", Url = "#" },
                            ],
                        },
                    ],
                },
                new MenuItem
                {
                    Title = "Fashion",
                    Icon = "ti ti-shirt",
                    Children =
                    [
                        new MenuItem { Title = "Pria", Url = "#" },
                        new MenuItem { Title = "Wanita", Url = "#" },
                        new MenuItem { Title = "Anak", Url = "#" },
                    ],
                },
                new MenuItem { Title = "Promo Spesial", Url = "#", Icon = "ti ti-discount-2" },
            ],
        },
        new MenuItem
        {
            Title = "Mega Menu",
            Icon = "ti ti-apps",
            Mega = true,
            Children =
            [
                new MenuItem
                {
                    Title = "Penjualan",
                    Children =
                    [
                        new MenuItem { Title = "Order", Url = "#", Icon = "ti ti-shopping-cart", Description = "Kelola pesanan masuk" },
                        new MenuItem { Title = "Produk", Url = "#", Icon = "ti ti-box", Description = "Katalog & stok barang" },
                        new MenuItem { Title = "Pelanggan", Url = "#", Icon = "ti ti-users", Description = "Data & segmentasi" },
                    ],
                },
                new MenuItem
                {
                    Title = "Konten",
                    Children =
                    [
                        new MenuItem { Title = "Halaman", Url = "#", Icon = "ti ti-file-text", Description = "Halaman statis situs" },
                        new MenuItem { Title = "Media", Url = "#", Icon = "ti ti-photo", Description = "Pustaka gambar & file" },
                        new MenuItem { Title = "Komentar", Url = "#", Icon = "ti ti-message-circle", Description = "Moderasi diskusi" },
                    ],
                },
                new MenuItem
                {
                    Title = "Laporan",
                    Children =
                    [
                        new MenuItem { Title = "Harian", Url = "#", Icon = "ti ti-calendar", Description = "Ringkasan per hari" },
                        new MenuItem { Title = "Bulanan", Url = "#", Icon = "ti ti-calendar-stats", Description = "Tren & perbandingan" },
                        new MenuItem { Title = "Ekspor CSV", Url = "#", Icon = "ti ti-download", Description = "Unduh data mentah" },
                    ],
                },
            ],
        },
        new MenuItem
        {
            Title = "Menu Bertingkat (Badge)",
            Icon = "ti ti-sitemap",
            Badge = "3",
            Children =
            [
                new MenuItem { Title = "Privacy", Url = "/Privacy", MatchPrefix = true },
                new MenuItem
                {
                    Title = "Level 2 (induk)",
                    Children =
                    [
                        new MenuItem { Title = "Level 3 — Item A", Url = "#" },
                        new MenuItem { Title = "Level 3 — Item B", Url = "#", Badge = "Baru", BadgeVariant = "success" },
                    ],
                },
            ],
        },
        new MenuItem
        {
            Title = "Notifikasi (Badge)",
            Url = "#",
            Icon = "ti ti-bell",
            Badge = "5",
            BadgeVariant = "danger",
        },
        new MenuItem
        {
            Title = "Segera Hadir (Disabled)",
            Url = "#",
            Icon = "ti ti-lock",
            Disabled = true,
            Badge = "Soon",
            BadgeVariant = "muted",
        },
        new MenuItem
        {
            Title = "Dokumentasi Tailwind",
            Url = "https://tailwindcss.com/docs",
            Icon = "ti ti-book",
            OpenInNewTab = true,
        },
#endif
    ]);
});

var app = builder.Build();

#if (useAuth)
// Terapkan migrasi EF saat startup → buat/upgrade SQLite + seed (demo; untuk produksi
// pertimbangkan migrasi terpisah dari startup).
app.Services.MigrateSpecaDatabase();
#endif

// PALING AWAL: terjemahkan X-Forwarded-* dari reverse proxy menjadi scheme/IP asli
// SEBELUM middleware lain (HTTPS-redirect, security headers, antiforgery) membacanya.
app.UseForwardedHeaders();

// Security headers + CSP (sadar-environment): produksi tanpa 'unsafe-eval',
// development mengizinkannya untuk HMR Vite. Dipasang paling awal agar
// melindungi setiap respons, termasuk halaman error.
app.UseSpecaSecurityHeaders(app.Environment);

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/StatusCode/{0}");

// Default aktif. Host desktop (Tauri sidecar) mematikannya via arg
// `--Hosting:HttpsRedirect false` karena webview memuat http://127.0.0.1
// tanpa endpoint TLS (lihat Apps/Desktop/src-tauri/src/lib.rs).
if (config.GetValue("Hosting:HttpsRedirect", true))
{
    app.UseHttpsRedirection();
}

// UseStaticFiles melayani wwwroot/dist (output Vite, hash di nama file);
// MapStaticAssets menangani asset Razor lain dengan fingerprinting .NET 9+.
app.UseStaticFiles();
app.UseRouting();

#if (proto)
// gRPC-Web: bungkus request gRPC-Web (dari browser) → gRPC. Harus setelah UseRouting,
// sebelum endpoint dipetakan. Same-origin → tak perlu CORS gRPC-Web.
app.UseGrpcWeb();

#endif
// CookiePolicy menjaring SEMUA cookie (Secure di produksi); CORS antara routing & auth.
app.UseCookiePolicy();
app.UseCors("SpecaCors");

#if (useAuth)
app.UseAuthentication();
#endif
app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();
app.MapDefaultControllerRoute();

#if (proto)
// Endpoint gRPC (juga aktif untuk gRPC-Web). Path wire: /greeter.v1.GreeterService/SayHello
app.MapGrpcService<GreeterRpcService>().EnableGrpcWeb();
#endif


if (app.Environment.IsDevelopment())
{
    // Proxy ke Vite dev server HANYA untuk /dist — endpoint Razor tetap
    // ditangani normal. (UseSpa tanpa MapWhen = catch-all yang menelan
    // semua request sebelum endpoint top-level dieksekusi.)
    app.MapWhen(
        context => context.Request.Path.StartsWithSegments("/dist"),
        spaApp => spaApp.UseSpa(spa =>
        {
            string port = ApplicationConfig["vite:server:port"] ?? "5173";
            string https = ApplicationConfig["vite:server:https"] ?? "False";
            string schema = Convert.ToBoolean(https) ? "https" : "http";

            spa.Options.SourcePath = "../";
            spa.Options.DevServerPort = Convert.ToInt32(port);
            spa.UseViteDevelopmentServer(scriptName: "dev", schema: schema);
        }));
}

app.Run();
