using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Speca.Portal.Pages
{
    public class ComponentsModel : PageModel
    {
        public class ContactForm
        {
            [Required(ErrorMessage = "Nama wajib diisi")]
            [StringLength(50, MinimumLength = 3, ErrorMessage = "Nama 3–50 karakter")]
            [Display(Name = "Nama")]
            public string? Name { get; set; }

            [Required(ErrorMessage = "Email wajib diisi")]
            [EmailAddress(ErrorMessage = "Format email tidak valid")]
            public string? Email { get; set; }

            [Required(ErrorMessage = "Pilih satu peran")]
            [Display(Name = "Peran")]
            public string? Role { get; set; }

            [StringLength(200, ErrorMessage = "Maksimal 200 karakter")]
            [Display(Name = "Catatan")]
            public string? Notes { get; set; }

            [CreditCard(ErrorMessage = "Nomor kartu tidak valid (cek Luhn)")]
            [Display(Name = "No. Kartu (opsional — demo validator creditcard)")]
            public string? CardNumber { get; set; }

            [Display(Name = "Aktif")]
            public bool IsActive { get; set; }
        }

        [BindProperty]
        public ContactForm Form { get; set; } = new();

        [TempData]
        public string? SuccessMessage { get; set; }

        public void OnGet()
        {
        }

        public IActionResult OnPost()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            SuccessMessage = $"Form valid — {Form.Name} ({Form.Email}) tersimpan (demo).";
            return RedirectToPage();
        }
    }
}
