namespace Speca.Data.Auth;

/// <summary>
/// Konfigurasi penerbitan &amp; validasi JWT (bagian "Jwt" di appsettings).
///
/// PRODUKSI: <see cref="SigningKey"/> WAJIB rahasia kuat (>= 32 byte) dari
/// user-secrets / environment / key vault — JANGAN commit. Nilai di appsettings.json
/// hanya untuk dev lokal dan sengaja ditandai demikian.
/// </summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "speca.portal";
    public string Audience { get; set; } = "speca.clients";

    /// <summary>Kunci simetris HMAC-SHA256. Dev: dari appsettings. Prod: dari secret store.</summary>
    public string SigningKey { get; set; } = "";

    /// <summary>Umur access token — sengaja PENDEK agar jendela penyalahgunaan kecil.</summary>
    public int AccessTokenMinutes { get; set; } = 15;

    /// <summary>Umur refresh token — panjang, tapi dirotasi & bisa dicabut.</summary>
    public int RefreshTokenDays { get; set; } = 14;
}
