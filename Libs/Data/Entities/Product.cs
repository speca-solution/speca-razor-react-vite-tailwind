namespace Speca.Data.Entities;

/// <summary>Entitas domain contoh (dikelola EF Core + dibaca via Dapper).</summary>
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    // Rupiah sebagai int → hindari jebakan decimal di SQLite (disimpan TEXT/REAL).
    public int Price { get; set; }
    public int Stock { get; set; }
}
