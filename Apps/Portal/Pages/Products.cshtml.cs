using Microsoft.AspNetCore.Mvc.RazorPages;
using Speca.Data.Queries;

namespace Speca.Portal.Pages;

/// <summary>Demo akses data HYBRID: skema+seed dari EF Core, dibaca via Dapper (IProductQueries).</summary>
public class ProductsModel(IProductQueries queries) : PageModel
{
    public IReadOnlyList<ProductRow> Products { get; private set; } = [];

    public async Task OnGetAsync() => Products = await queries.GetTopByStockAsync(10);
}
