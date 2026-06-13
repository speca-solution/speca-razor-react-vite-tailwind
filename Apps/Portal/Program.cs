
using Speca.Core.Extensions;
using Speca.UI.Navigation;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;
var ApplicationConfig = config.GetSection("Application");

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

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
