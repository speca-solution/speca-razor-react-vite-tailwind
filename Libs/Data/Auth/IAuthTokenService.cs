namespace Speca.Data.Auth;

/// <summary>Sepasang token hasil login/refresh. Refresh token dikembalikan MENTAH satu kali
/// (klien menyimpannya aman); server hanya menyimpan hash-nya.</summary>
public sealed record TokenPair(
    string AccessToken,
    DateTimeOffset AccessExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshExpiresAt);

/// <summary>Dilempar saat refresh gagal (token tak dikenal, kedaluwarsa, atau reuse
/// terdeteksi). Endpoint memetakannya ke 401 tanpa membocorkan sebab detail ke klien.</summary>
public sealed class InvalidRefreshTokenException(string message) : Exception(message);

public interface IAuthTokenService
{
    /// <summary>Terbitkan pasangan token untuk user (dipanggil setelah login sukses).
    /// Memulai keluarga refresh-token baru.</summary>
    Task<TokenPair> IssueAsync(string userId, CancellationToken ct = default);

    /// <summary>Rotasi: validasi refresh token, cabut yang lama, terbitkan yang baru.
    /// Bila token yang sudah dicabut dipakai ulang → cabut SELURUH keluarga (reuse
    /// detection) dan lempar <see cref="InvalidRefreshTokenException"/>.</summary>
    Task<TokenPair> RefreshAsync(string refreshToken, CancellationToken ct = default);

    /// <summary>Cabut satu refresh token (logout). Idempoten: token tak dikenal diabaikan.</summary>
    Task RevokeAsync(string refreshToken, CancellationToken ct = default);
}
