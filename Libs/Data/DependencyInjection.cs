using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Speca.Data.Auth;
using Speca.Data.Queries;

namespace Speca.Data;

public static class DependencyInjection
{
    /// <summary>
    /// Daftarkan akses data HYBRID: EF Core (DbContext + ASP.NET Identity store) untuk
    /// skema/write/auth, + query objects Dapper untuk sisi-baca. DB default SQLite
    /// (connection string "Default"; ganti provider/host untuk produksi).
    /// </summary>
    public static IServiceCollection AddSpecaData(this IServiceCollection services, IConfiguration config)
    {
        var connectionString = config.GetConnectionString("Default") ?? "Data Source=app.db";

        services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

        services.AddIdentity<IdentityUser, IdentityRole>(options =>
            {
                // Aturan demo yang longgar; perketat untuk produksi.
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.SignIn.RequireConfirmedAccount = false;
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        // Sisi-baca (Dapper).
        services.AddScoped<IProductQueries, ProductQueries>();

        // Penerbitan token (access JWT pendek + refresh rotation + reuse detection).
        // Validasi JwtBearer & endpoint /auth di-wire di Portal/Program.cs.
        services.AddOptions<JwtOptions>()
            .Bind(config.GetSection(JwtOptions.SectionName))
            .Validate(o => !string.IsNullOrWhiteSpace(o.SigningKey) && o.SigningKey.Length >= 32,
                "Jwt:SigningKey wajib diisi minimal 32 karakter (dev: appsettings; prod: user-secrets/env).")
            .ValidateOnStart();
        services.AddScoped<IAuthTokenService, AuthTokenService>();

        return services;
    }

    /// <summary>Terapkan migrasi EF saat startup (membuat/upgrade file SQLite + seed).</summary>
    public static void MigrateSpecaDatabase(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        sp.GetRequiredService<AppDbContext>().Database.Migrate();
        SeedDemoUser(sp).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Seed satu user demo agar login (cookie & token API) langsung bisa dicoba.
    /// DEMO SAJA — hapus/ubah untuk produksi. Kredensial: demo@speca.test / Demo!2345.
    /// </summary>
    private static async Task SeedDemoUser(IServiceProvider sp)
    {
        var users = sp.GetRequiredService<UserManager<IdentityUser>>();
        const string email = "demo@speca.test";
        if (await users.FindByEmailAsync(email) is not null)
        {
            return;
        }

        var user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
        await users.CreateAsync(user, "Demo!2345");
    }
}
