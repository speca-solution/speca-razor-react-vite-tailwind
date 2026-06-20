#if (useAuth)
using Microsoft.AspNetCore.Identity;
#endif
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Speca.Portal.Pages.Account;

#if (useAuth)
public class LoginModel(SignInManager<IdentityUser> signInManager) : PageModel
#else
public class LoginModel : PageModel
#endif
{
    [BindProperty]
    public InputModel Input { get; set; } = new();

    public string? ErrorMessage { get; set; }

    public class InputModel
    {
        [Required(ErrorMessage = "Email wajib diisi")]
        [EmailAddress(ErrorMessage = "Format email tidak valid")]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Password wajib diisi")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = "";

        [Display(Name = "Ingat saya")]
        public bool RememberMe { get; set; }
    }

    public void OnGet() { }

#if (useAuth)
    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        // UserName = Email (lihat RegisterModel) → login dengan email.
        var result = await signInManager.PasswordSignInAsync(
            Input.Email, Input.Password, Input.RememberMe, lockoutOnFailure: false);

        if (result.Succeeded) return RedirectToPage("/Index");

        ErrorMessage = "Email atau password salah.";
        return Page();
    }
#else
    public IActionResult OnPost()
    {
        if (!ModelState.IsValid) return Page();
        // Demo UI saja. Aktifkan auth nyata: dotnet new speca-template --auth identity
        return RedirectToPage("/Index");
    }
#endif
}
