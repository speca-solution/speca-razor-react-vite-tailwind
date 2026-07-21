using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Speca.Data.Auth;

namespace Speca.Portal.Endpoints;

/// <summary>
/// API token (JSON) untuk klien non-cookie (mobile/desktop/SPA): login menukar
/// kredensial dengan access JWT pendek + refresh token; refresh merotasi; logout mencabut.
/// Razor Pages tetap memakai cookie (Account/Login) — dua jalur hidup berdampingan.
/// </summary>
public static class AuthEndpoints
{
    public sealed record LoginRequest(string Email, string Password);
    public sealed record RefreshRequest(string RefreshToken);
    public sealed record TokenResponse(
        string accessToken, long accessExpiresAtUnixMs,
        string refreshToken, long refreshExpiresAtUnixMs);

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth");

        // Login: rate-limited (anti brute force) + lockoutOnFailure (Identity).
        group.MapPost("/login", async (
            LoginRequest req,
            SignInManager<IdentityUser> signIn,
            UserManager<IdentityUser> users,
            IAuthTokenService tokens) =>
        {
            var user = await users.FindByEmailAsync(req.Email);
            if (user is null)
            {
                return Results.Unauthorized(); // pesan seragam (tak bocorkan email terdaftar/tidak)
            }

            var result = await signIn.CheckPasswordSignInAsync(user, req.Password, lockoutOnFailure: true);
            if (!result.Succeeded)
            {
                return Results.Unauthorized();
            }

            var pair = await tokens.IssueAsync(user.Id);
            return Results.Ok(ToResponse(pair));
        }).RequireRateLimiting("auth-login");

        // Refresh: rotasi + reuse detection (lihat AuthTokenService).
        group.MapPost("/refresh", async (RefreshRequest req, IAuthTokenService tokens) =>
        {
            try
            {
                var pair = await tokens.RefreshAsync(req.RefreshToken);
                return Results.Ok(ToResponse(pair));
            }
            catch (InvalidRefreshTokenException)
            {
                return Results.Unauthorized();
            }
        });

        // Logout: cabut refresh token (idempoten).
        group.MapPost("/logout", async (RefreshRequest req, IAuthTokenService tokens) =>
        {
            await tokens.RevokeAsync(req.RefreshToken);
            return Results.NoContent();
        });

        // Bukti enforcement: butuh access JWT valid (skema Bearer). Tanpa/kедaluwarsa → 401.
        group.MapGet("/me", (ClaimsPrincipal user) => Results.Ok(new
        {
            sub = user.FindFirstValue(ClaimTypes.NameIdentifier),
            name = user.Identity?.Name,
        })).RequireAuthorization("BearerOnly");

        return app;
    }

    private static TokenResponse ToResponse(TokenPair p) => new(
        p.AccessToken, p.AccessExpiresAt.ToUnixTimeMilliseconds(),
        p.RefreshToken, p.RefreshExpiresAt.ToUnixTimeMilliseconds());
}
