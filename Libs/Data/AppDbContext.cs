using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Speca.Data.Entities;

namespace Speca.Data;

/// <summary>
/// DbContext aplikasi: tabel ASP.NET Identity (IdentityUser/Role) + entitas domain.
/// EF Core mengelola SKEMA (migrasi) & WRITE; query baca berat pakai Dapper (lihat Queries/).
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Seed data contoh (ikut migrasi).
        builder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Keyboard Mekanik", Price = 750_000, Stock = 24 },
            new Product { Id = 2, Name = "Mouse Wireless", Price = 250_000, Stock = 60 },
            new Product { Id = 3, Name = "Monitor 27 inci", Price = 2_500_000, Stock = 12 },
            new Product { Id = 4, Name = "Webcam HD", Price = 450_000, Stock = 33 },
            new Product { Id = 5, Name = "Headset", Price = 600_000, Stock = 18 }
        );
    }
}
