namespace Speca.Data.Queries;

/// <summary>Hasil baca ringan (DTO) — bukan entitas EF. Dipetakan Dapper positional.
/// Tipe <c>long</c>: SQLite menyimpan INTEGER 8-byte → Dapper mengembalikan Int64.</summary>
public sealed record ProductRow(long Id, string Name, long Price, long Stock);

/// <summary>
/// QUERY OBJECT (sisi-baca) — pakai Dapper untuk SQL eksplisit/cepat. Pola yang
/// dipisah BUKAN generic repository (anti-pattern di atas EF); ini mengelompokkan
/// query terkait + menyembunyikan SQL + mudah di-mock.
/// </summary>
public interface IProductQueries
{
    Task<IReadOnlyList<ProductRow>> GetTopByStockAsync(int take = 5);
}
