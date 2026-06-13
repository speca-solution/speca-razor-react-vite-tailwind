using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Speca.Portal.Pages
{
    /// <summary>
    /// Demo grafik dengan ApexCharts (vendor opsional, dimuat per halaman).
    /// Konfigurasi chart dikirim sebagai JSON di &lt;script type="application/json"&gt;
    /// lalu di-render vendors/apexcharts — tanpa inline-JS (ramah CSP ketat).
    /// </summary>
    public class ChartsModel : PageModel
    {
        public void OnGet() { }
    }
}
