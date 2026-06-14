using Microsoft.Extensions.DependencyInjection;

namespace Speca.UI.Navigation
{
    /// <summary>
    /// Definisi menu sidebar/topbar — dirender _Sidebar_Menu.cshtml (rekursif, multi-level)
    /// dan _Menu_Horizontal.cshtml (2 level + grup level-3, lihat README).
    /// </summary>
    public sealed class MenuItem
    {
        public string Title { get; init; } = "";

        /// <summary>Null = item induk (accordion) atau heading.</summary>
        public string? Url { get; init; }

        /// <summary>Class icon — Tabler ("ti ti-home") atau Lucide ("icon-house").</summary>
        public string? Icon { get; init; }

        /// <summary>True = label section (bukan link).</summary>
        public bool IsHeading { get; init; }

        /// <summary>Teks badge, mis. "5" atau "Baru". Null = tanpa badge.</summary>
        public string? Badge { get; init; }

        /// <summary>Variant badge: primary | success | warning | danger.</summary>
        public string BadgeVariant { get; init; } = "primary";

        /// <summary>Item tidak bisa diklik/dibuka (redup).</summary>
        public bool Disabled { get; init; }

        /// <summary>Buka di tab baru (target=_blank rel=noopener) — untuk link eksternal.</summary>
        public bool OpenInNewTab { get; init; }

        /// <summary>
        /// Active bila path saat ini diawali Url (mis. /products aktif untuk /products/123).
        /// Url "/" selalu exact-match.
        /// </summary>
        public bool MatchPrefix { get; init; }

        /// <summary>
        /// Hanya untuk menu HORIZONTAL: render dropdown sebagai panel MEGA multi-kolom
        /// (tiap Child = kolom grup, grandchild = link). Diabaikan di sidebar (tetap accordion).
        /// </summary>
        public bool Mega { get; init; }

        /// <summary>Deskripsi singkat — dipakai link di panel MEGA (di bawah judul). Opsional.</summary>
        public string? Description { get; init; }

        /// <summary>True = tampil sebagai shortcut di BOTTOM NAVIGATION mobile (_BottomNav).</summary>
        public bool MobilePrimary { get; init; }

        /// <summary>Label pendek (bottom nav, dll). Null → pakai Title.</summary>
        public string? ShortLabel { get; init; }

        public List<MenuItem> Children { get; init; } = [];
    }

    public sealed class SpecaMenuOptions
    {
        public List<MenuItem> Items { get; } = [];

        /// <summary>Membuka satu accordion menutup saudaranya (ala referensi). Default true.</summary>
        public bool AccordionSingleOpen { get; set; } = true;
    }

    /// <summary>Logika active-state — dipisah dari renderer agar bisa di-unit-test.</summary>
    public static class MenuItemExtensions
    {
        public static bool IsActive(this MenuItem item, string currentPath)
        {
            if (item.Url is null) { return false; }

            var url = item.Url.TrimEnd('/');
            if (url.Length == 0) { url = "/"; }
            var path = currentPath.TrimEnd('/');
            if (path.Length == 0) { path = "/"; }

            if (string.Equals(url, path, StringComparison.OrdinalIgnoreCase)) { return true; }

            return item.MatchPrefix
                && url != "/"
                && path.StartsWith(url + "/", StringComparison.OrdinalIgnoreCase);
        }

        public static bool HasActiveDescendant(this MenuItem item, string currentPath) =>
            item.Children.Any(c => c.IsActive(currentPath) || c.HasActiveDescendant(currentPath));
    }

    public static class SpecaMenuServiceCollectionExtensions
    {
        public static IServiceCollection AddSpecaMenu(this IServiceCollection services, Action<SpecaMenuOptions> configure)
        {
            services.Configure(configure);
            return services;
        }
    }
}
