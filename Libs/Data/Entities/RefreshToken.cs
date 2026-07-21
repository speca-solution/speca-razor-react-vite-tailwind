namespace Speca.Data.Entities;

/// <summary>
/// Refresh token yang DIROTASI + tahan pencurian (reuse detection).
///
/// Keamanan (bukan semu):
/// - <see cref="TokenHash"/> menyimpan HASH (SHA-256) dari token, bukan token mentah.
///   DB bocor → penyerang tetap tak punya token yang bisa dipakai.
/// - Sekali dipakai, token di-<see cref="Revoked"/> dan digantikan
///   (<see cref="ReplacedByTokenHash"/>) — rotasi.
/// - Semua token turunan dari satu login berbagi <see cref="FamilyId"/>. Bila token
///   yang SUDAH direvokasi dipakai lagi (indikasi kuat token dicuri), SELURUH keluarga
///   dicabut → sesi mati, penyerang & korban sama-sama harus login ulang.
/// </summary>
public class RefreshToken
{
    public int Id { get; set; }

    /// <summary>FK ke IdentityUser.Id.</summary>
    public string UserId { get; set; } = "";

    /// <summary>SHA-256 (Base64) dari token mentah. Token mentah TIDAK pernah disimpan.</summary>
    public string TokenHash { get; set; } = "";

    /// <summary>Semua token hasil rotasi dari satu login berbagi id ini (untuk pencabutan massal).</summary>
    public Guid FamilyId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>Diisi saat token dipakai (rotasi) atau dicabut (logout / reuse-detection).</summary>
    public DateTimeOffset? RevokedAt { get; set; }

    /// <summary>Hash token pengganti (jejak rantai rotasi; audit).</summary>
    public string? ReplacedByTokenHash { get; set; }

    public bool IsActive => RevokedAt is null && DateTimeOffset.UtcNow < ExpiresAt;
}
