using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Speca.Data;

/// <summary>
/// Factory design-time: dipakai HANYA oleh `dotnet ef` (migrations) agar bisa
/// membuat AppDbContext tanpa menjalankan aplikasi. Runtime memakai AddSpecaData().
/// </summary>
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=app.db")
            .Options;
        return new AppDbContext(options);
    }
}
