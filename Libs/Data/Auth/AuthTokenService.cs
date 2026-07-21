using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Speca.Data.Entities;

namespace Speca.Data.Auth;

/// <summary>
/// Penerbit token milik Portal sendiri (self-issued): access JWT HMAC-SHA256 berumur
/// pendek + refresh token yang dirotasi dengan deteksi reuse. Lihat <see cref="RefreshToken"/>
/// dan <see cref="JwtOptions"/> untuk model ancaman.
/// </summary>
public sealed class AuthTokenService(
    AppDbContext db,
    UserManager<IdentityUser> users,
    IOptions<JwtOptions> options) : IAuthTokenService
{
    private readonly JwtOptions _opt = options.Value;

    public async Task<TokenPair> IssueAsync(string userId, CancellationToken ct = default)
        => await IssueForFamilyAsync(userId, Guid.NewGuid(), ct);

    public async Task<TokenPair> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var hash = Hash(refreshToken);
        var existing = await db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == hash, ct);

        // Token tak dikenal → tolak (tak membocorkan apakah pernah ada).
        if (existing is null)
        {
            throw new InvalidRefreshTokenException("Refresh token tidak dikenal.");
        }

        // REUSE DETECTION: token yang sudah dicabut/dirotasi dipakai lagi = indikasi
        // pencurian. Cabut seluruh keluarga → semua sesi turunannya mati.
        if (!existing.IsActive)
        {
            await RevokeFamilyAsync(existing.FamilyId, ct);
            throw new InvalidRefreshTokenException("Refresh token sudah tidak berlaku (kemungkinan reuse).");
        }

        // Rotasi: cabut yang lama, terbitkan penerus dalam keluarga yang sama.
        var pair = await IssueForFamilyAsync(existing.UserId, existing.FamilyId, ct);
        existing.RevokedAt = DateTimeOffset.UtcNow;
        existing.ReplacedByTokenHash = Hash(pair.RefreshToken);
        await db.SaveChangesAsync(ct);
        return pair;
    }

    public async Task RevokeAsync(string refreshToken, CancellationToken ct = default)
    {
        var hash = Hash(refreshToken);
        var existing = await db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == hash, ct);
        if (existing is { RevokedAt: null })
        {
            existing.RevokedAt = DateTimeOffset.UtcNow;
            await db.SaveChangesAsync(ct);
        }
    }

    private async Task<TokenPair> IssueForFamilyAsync(string userId, Guid familyId, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(userId)
            ?? throw new InvalidRefreshTokenException("User tidak ditemukan.");

        var now = DateTimeOffset.UtcNow;
        var accessExpires = now.AddMinutes(_opt.AccessTokenMinutes);
        var refreshExpires = now.AddDays(_opt.RefreshTokenDays);

        var accessToken = CreateAccessToken(user, now, accessExpires);

        // Refresh token = 256-bit acak kriptografis; hanya HASH disimpan.
        var rawRefresh = Base64Url(RandomNumberGenerator.GetBytes(32));
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            TokenHash = Hash(rawRefresh),
            FamilyId = familyId,
            CreatedAt = now,
            ExpiresAt = refreshExpires,
        });
        await db.SaveChangesAsync(ct);

        return new TokenPair(accessToken, accessExpires, rawRefresh, refreshExpires);
    }

    private string CreateAccessToken(IdentityUser user, DateTimeOffset now, DateTimeOffset expires)
    {
        var claims = new Dictionary<string, object>
        {
            [JwtRegisteredClaimNames.Sub] = user.Id,
            [JwtRegisteredClaimNames.Jti] = Guid.NewGuid().ToString(),
            [ClaimTypes.NameIdentifier] = user.Id,
            [JwtRegisteredClaimNames.Name] = user.UserName ?? user.Id,
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.SigningKey));
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _opt.Issuer,
            Audience = _opt.Audience,
            IssuedAt = now.UtcDateTime,
            NotBefore = now.UtcDateTime,
            Expires = expires.UtcDateTime,
            Claims = claims,
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
        };
        return new JsonWebTokenHandler().CreateToken(descriptor);
    }

    private async Task RevokeFamilyAsync(Guid familyId, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        await db.RefreshTokens
            .Where(t => t.FamilyId == familyId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now), ct);
    }

    private static string Hash(string value)
        => Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    private static string Base64Url(byte[] bytes)
        => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
