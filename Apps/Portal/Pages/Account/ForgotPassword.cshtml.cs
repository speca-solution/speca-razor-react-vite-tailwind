using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Speca.Portal.Pages.Account;

public class ForgotPasswordModel : PageModel
{
    [BindProperty]
    public InputModel Input { get; set; } = new();

    public bool EmailSent { get; set; }

    public class InputModel
    {
        [Required(ErrorMessage = "Email wajib diisi")]
        [EmailAddress(ErrorMessage = "Format email tidak valid")]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";
    }

    public void OnGet() { }

    public IActionResult OnPost()
    {
        if (!ModelState.IsValid) return Page();
        // TODO: kirim email reset via Identity / SMTP
        EmailSent = true;
        return Page();
    }
}
