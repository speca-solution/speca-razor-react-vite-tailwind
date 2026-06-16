using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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

        return services;
    }

    /// <summary>Terapkan migrasi EF saat startup (membuat/upgrade file SQLite + seed).</summary>
    public static void MigrateSpecaDatabase(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
    }
}
