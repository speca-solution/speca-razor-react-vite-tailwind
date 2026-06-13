using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Speca.Portal.Pages
{
    /// <summary>
    /// Demo pola tabel CRUD server-side: search (q), sort (sort+dir), paging (p).
    /// Di aplikasi nyata, ganti sumber data in-memory dengan query EF Core
    /// (Where/OrderBy/Skip/Take identik — pola tidak berubah).
    /// </summary>
    public class TablesModel : PageModel
    {
        public sealed record Product(int Id, string Name, string Category, decimal Price, int Stock, bool Active);

        private static readonly string[] Categories = ["Elektronik", "Fashion", "Rumah", "Olahraga"];

        // Deterministik agar demo (dan smoke test) stabil.
        private static readonly List<Product> All = [.. Enumerable.Range(1, 57).Select(i => new Product(
            i,
            $"Produk {i:D2}",
            Categories[i % Categories.Length],
            10_000 + (i * i * 37) % 900_000,
            (i * 13) % 200,
            i % 5 != 0))];

        public const int PageSize = 10;

        [BindProperty(SupportsGet = true)] public string? Q { get; set; }
        [BindProperty(SupportsGet = true)] public string Sort { get; set; } = "name";
        [BindProperty(SupportsGet = true)] public string Dir { get; set; } = "asc";
        [BindProperty(SupportsGet = true)] public int P { get; set; } = 1;

        public IReadOnlyList<Product> Items { get; private set; } = [];
        public int Total { get; private set; }
        public int TotalPages { get; private set; }
        public int From => Total == 0 ? 0 : (P - 1) * PageSize + 1;
        public int To => Math.Min(P * PageSize, Total);

        public void OnGet()
        {
            var query = All.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(Q))
            {
                query = query.Where(x =>
                    x.Name.Contains(Q, StringComparison.OrdinalIgnoreCase) ||
                    x.Category.Contains(Q, StringComparison.OrdinalIgnoreCase));
            }

            var desc = string.Equals(Dir, "desc", StringComparison.OrdinalIgnoreCase);
            query = (Sort.ToLowerInvariant(), desc) switch
            {
                ("price", false) => query.OrderBy(x => x.Price),
                ("price", true) => query.OrderByDescending(x => x.Price),
                ("stock", false) => query.OrderBy(x => x.Stock),
                ("stock", true) => query.OrderByDescending(x => x.Stock),
                (_, true) => query.OrderByDescending(x => x.Name),
                _ => query.OrderBy(x => x.Name),
            };

            var list = query.ToList();
            Total = list.Count;
            TotalPages = Math.Max(1, (int)Math.Ceiling(Total / (double)PageSize));
            P = Math.Clamp(P, 1, TotalPages);
            Items = list.Skip((P - 1) * PageSize).Take(PageSize).ToList();
        }

        public string SortUrl(string column)
        {
            var nextDir = string.Equals(Sort, column, StringComparison.OrdinalIgnoreCase) && Dir == "asc" ? "desc" : "asc";
            return $"?q={Uri.EscapeDataString(Q ?? "")}&sort={column}&dir={nextDir}&p=1";
        }

        public string PageUrl(int page) =>
            $"?q={Uri.EscapeDataString(Q ?? "")}&sort={Sort}&dir={Dir}&p={page}";

        public string SortIcon(string column) =>
            !string.Equals(Sort, column, StringComparison.OrdinalIgnoreCase)
                ? "ti ti-arrows-sort opacity-40"
                : Dir == "asc" ? "ti ti-arrow-up" : "ti ti-arrow-down";
    }
}
