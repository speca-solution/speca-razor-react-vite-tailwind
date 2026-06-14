using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Text.Json;

namespace Speca.Portal.Pages
{
    public class ReactDemoModel : PageModel
    {
        /// <summary>Data awal yang di-serialize ke React (lihat ReactDemo.cshtml + main.tsx).</summary>
        public sealed record DashboardData(string UserName, int Projects, int OpenTasks);

        private static readonly JsonSerializerOptions CamelCase = new(JsonSerializerDefaults.Web);

        public DashboardData Data { get; private set; } = new("Tamu", 0, 0);

        public string DataJson => JsonSerializer.Serialize(Data, CamelCase);

        public void OnGet()
        {
            // Contoh: di aplikasi nyata, ambil dari database/service.
            Data = new DashboardData("Acep", 12, 34);
        }
    }
}
