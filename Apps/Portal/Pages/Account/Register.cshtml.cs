#if (useAuth)
using Microsoft.AspNetCore.Identity;
#endif
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Speca.Portal.Pages.Account;

#if (useAuth)
public class RegisterModel(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager) : PageModel
#else
public class RegisterModel : PageModel
#endif
{
    [BindProperty]
    public InputModel Input { get; set; } = new();

    public string? ErrorMessage { get; set; }

    public class InputModel
    {
        [Required(ErrorMessage = "Nama lengkap wajib diisi")]
        [StringLength(100, ErrorMessage = "Nama maksimal 100 karakter")]
        [Display(Name = "Nama Lengkap")]
        public string FullName { get; set; } = "";

        [Required(ErrorMessage = "Email wajib diisi")]
        [EmailAddress(ErrorMessage = "Format email tidak valid")]
        [Display(Name = "Email")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Password wajib diisi")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password minimal 8 karakter")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; } = "";

        [Required(ErrorMessage = "Konfirmasi password wajib diisi")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Konfirmasi password tidak cocok")]
        [Display(Name = "Konfirmasi Password")]
        public string ConfirmPassword { get; set; } = "";

        [Range(typeof(bool), "true", "true", ErrorMessage = "Anda harus menyetujui syarat & ketentuan")]
        [Display(Name = "Syarat & Ketentuan")]
        public bool AgreeTerms { get; set; }
    }

    public void OnGet() { }

#if (useAuth)
    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        // UserName = Email agar bisa login dengan email. (FullName demo: bisa disimpan
        // sebagai claim/kolom kustom bila perlu.)
        var user = new IdentityUser { UserName = Input.Email, Email = Input.Email };
        var result = await userManager.CreateAsync(user, Input.Password);
        if (result.Succeeded)
        {
            await signInManager.SignInAsync(user, isPersistent: false);
            return RedirectToPage("/Index");
        }

        ErrorMessage = string.Join(" ", result.Errors.Select(e => e.Description));
        return Page();
    }
#else
    public IActionResult OnPost()
    {
        if (!ModelState.IsValid) return Page();
        // Demo UI saja. Aktifkan auth nyata: dotnet new speca-platform --auth identity
        return RedirectToPage("/Account/Login");
    }
#endif
}
