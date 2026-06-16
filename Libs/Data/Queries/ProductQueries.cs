using Dapper;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;

namespace Speca.Data.Queries;

/// <summary>
/// Implementasi Dapper: buka koneksi ke DB yang SAMA dengan EF (connection string
/// "Default"), jalankan SQL eksplisit. EF mengelola skema; Dapper hanya membaca.
/// </summary>
public sealed class ProductQueries(IConfiguration config) : IProductQueries
{
    private string ConnectionString =>
        config.GetConnectionString("Default") ?? "Data Source=app.db";

    public async Task<IReadOnlyList<ProductRow>> GetTopByStockAsync(int take = 5)
    {
        await using var connection = new SqliteConnection(ConnectionString);
        var rows = await connection.QueryAsync<ProductRow>(
            "SELECT Id, Name, Price, Stock FROM Products ORDER BY Stock DESC LIMIT @take",
            new { take });
        return rows.AsList();
    }
}
