namespace Speca.UI.Components
{
    /// <summary>Item breadcrumb — Url null = item aktif (halaman saat ini).</summary>
    public sealed record BreadcrumbItem(string Title, string? Url = null);
}
