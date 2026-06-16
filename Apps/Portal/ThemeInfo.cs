namespace Speca.Portal;

/// <summary>
/// Tema yang DISERTAKAN (ditentukan saat instantiate via <c>--theme</c>). Dipakai halaman
/// Preview (Index) untuk membangun iframe & opsi dashboard hanya dari tema yang ada — agar
/// instance satu-tema tidak merujuk tema yang sudah dibuang. Konstanta useTheme1/useTheme2
/// di-define di csproj (default keduanya); template engine melucuti yang tak dipilih.
/// </summary>
public static class ThemeInfo
{
    public sealed record View(string Key, string Style, string Label, string DashboardPath);

    public static readonly View[] All =
    [
#if (useTheme1)
        new("metronic", "style01", "Theme 1 — Metronic", "/Dashboards/Metronic"),
#endif
#if (useTheme2)
        new("vuexy", "style02", "Theme 2 — Vuexy", "/Dashboards/Vuexy"),
#endif
    ];
}
