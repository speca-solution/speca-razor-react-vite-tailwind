
using Microsoft.AspNetCore.HttpOverrides;
using Speca.Core.Extensions;
using Speca.UI.Navigation;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;
var ApplicationConfig = config.GetSection("Application");

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

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
        new MenuItem
        {
            Title = "Dashboard",
            Url = "/",
            Icon = "ti ti-layout-dashboard",
        },
        new MenuItem { Title = "Tampilan", IsHeading = true },
        new MenuItem
        {
            Title = "Theme 2",
            Url = "/Theme2",
            Icon = "ti ti-palette",
        },
        new MenuItem
        {
            Title = "Layout 2 — Horizontal",
            Url = "/Layout2",
            Icon = "ti ti-layout-navbar",
        },
        new MenuItem
        {
            Title = "Components",
            Url = "/Components",
            Icon = "ti ti-components",
        },
        new MenuItem
        {
            Title = "Tabel Data",
            Url = "/Tables",
            Icon = "ti ti-table",
        },
        new MenuItem
        {
            Title = "Charts",
            Url = "/Charts",
            Icon = "ti ti-chart-line",
        },
        new MenuItem
        {
            Title = "Pengaturan",
            Url = "/Settings",
            Icon = "ti ti-settings",
        },
        new MenuItem { Title = "Halaman Auth & Error", IsHeading = true },
        new MenuItem
        {
            Title = "Masuk (Login)",
            Url = "/Account/Login",
            Icon = "ti ti-login",
        },
        new MenuItem
        {
            Title = "Daftar (Register)",
            Url = "/Account/Register",
            Icon = "ti ti-user-plus",
        },
        new MenuItem
        {
            Title = "Lupa Password",
            Url = "/Account/ForgotPassword",
            Icon = "ti ti-key",
        },
        new MenuItem
        {
            Title = "Error 404",
            Url = "/StatusCode/404",
            Icon = "ti ti-mood-sad",
        },
        new MenuItem
        {
            Title = "Error 500",
            Url = "/Error",
            Icon = "ti ti-alert-triangle",
        },
        new MenuItem { Title = "Contoh Fitur Menu", IsHeading = true },
        new MenuItem
        {
            Title = "Bertingkat 3 Level",
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
            Title = "Notifikasi",
            Url = "#",
            Icon = "ti ti-bell",
            Badge = "5",
            BadgeVariant = "danger",
        },
        new MenuItem
        {
            Title = "Segera Hadir",
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
    ]);
});

var app = builder.Build();

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

app.UseHttpsRedirection();

// UseStaticFiles melayani wwwroot/dist (output Vite, hash di nama file);
// MapStaticAssets menangani asset Razor lain dengan fingerprinting .NET 9+.
app.UseStaticFiles();
app.UseRouting();

// CookiePolicy menjaring SEMUA cookie (Secure di produksi); CORS antara routing & auth.
app.UseCookiePolicy();
app.UseCors("SpecaCors");

// Tambahkan app.UseAuthentication() di sini bila memakai autentikasi.
app.UseAuthorization();

app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();
app.MapDefaultControllerRoute();


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
