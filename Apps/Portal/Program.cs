
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
            TailwindIcon = "ti ti-layout-dashboard",
            BootstrapIcon = "bi bi-house",
        },
        new MenuItem { Title = "Layouts", IsHeading = true },
        new MenuItem
        {
            Title = "Layout 2 — Vuexy/BS",
            Url = "/Layout2",
            TailwindIcon = "ti ti-layout-sidebar",
            BootstrapIcon = "bi bi-layout-sidebar",
        },
        new MenuItem
        {
            Title = "Layout 3 — Vuexy/TW",
            Url = "/Layout3",
            TailwindIcon = "ti ti-palette",
            BootstrapIcon = "bi bi-palette",
        },
        new MenuItem
        {
            Title = "Layout 4 — Metronic/BS",
            Url = "/Layout4",
            TailwindIcon = "ti ti-layout-grid",
            BootstrapIcon = "bi bi-grid",
        },
        new MenuItem
        {
            Title = "Contoh Bertingkat",
            TailwindIcon = "ti ti-settings",
            BootstrapIcon = "bi bi-collection",
            Children =
            [
                new MenuItem { Title = "Sub Item 1", Url = "/Privacy" },
                new MenuItem { Title = "Sub Item 2", Url = "#" },
            ],
        },
    ]);
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

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
