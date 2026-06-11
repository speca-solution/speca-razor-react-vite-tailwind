using Microsoft.Extensions.DependencyInjection;

namespace Speca.UI.Navigation
{
    /// <summary>
    /// Satu definisi menu untuk semua theme. Renderer per-theme:
    /// Tailwind  → Pages/Shared/Tailwind/_Sidebar_Menu.cshtml
    /// Bootstrap → Pages/Shared/Bootstrap/_Menu.cshtml
    /// </summary>
    public sealed class MenuItem
    {
        public string Title { get; init; } = "";

        /// <summary>Null = item induk (accordion) atau heading.</summary>
        public string? Url { get; init; }

        /// <summary>Class icon untuk theme Tailwind — Tabler ("ti ti-home") atau Lucide ("icon-house").</summary>
        public string? TailwindIcon { get; init; }

        /// <summary>Class icon untuk theme Bootstrap (Bootstrap Icons), mis. "bi bi-house".</summary>
        public string? BootstrapIcon { get; init; }

        /// <summary>True = label section (bukan link).</summary>
        public bool IsHeading { get; init; }

        public List<MenuItem> Children { get; init; } = [];
    }

    public sealed class SpecaMenuOptions
    {
        public List<MenuItem> Items { get; } = [];
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
