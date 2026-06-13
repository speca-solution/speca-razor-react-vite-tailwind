using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace Speca.Portal.Pages;

public class SettingsModel : PageModel
{
    [BindProperty]
    public ProfileInput Profile { get; set; } = new();

    [BindProperty]
    public PasswordInput Password { get; set; } = new();

    public string? SuccessMessage { get; set; }

    public class ProfileInput
    {
        [Required(ErrorMessage = "Nama wajib diisi")]
        [StringLength(100, ErrorMessage = "Nama maksimal 100 karakter")]
        [Display(Name = "Nama Lengkap")]
        public string FullName { get; set; } = "Speca Admin";

        [Required(ErrorMessage = "Email wajib diisi")]
        [EmailAddress(ErrorMessage = "Format email tidak valid")]
        [Display(Name = "Email")]
        public string Email { get; set; } = "admin@speca.local";

        [Phone(ErrorMessage = "Format nomor telepon tidak valid")]
        [Display(Name = "Nomor Telepon")]
        public string? Phone { get; set; }

        [StringLength(200, ErrorMessage = "Bio maksimal 200 karakter")]
        [Display(Name = "Bio")]
        public string? Bio { get; set; }
    }

    public class PasswordInput
    {
        [Required(ErrorMessage = "Password saat ini wajib diisi")]
        [DataType(DataType.Password)]
        [Display(Name = "Password Saat Ini")]
        public string CurrentPassword { get; set; } = "";

        [Required(ErrorMessage = "Password baru wajib diisi")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password baru minimal 8 karakter")]
        [DataType(DataType.Password)]
        [Display(Name = "Password Baru")]
        public string NewPassword { get; set; } = "";

        [Required(ErrorMessage = "Konfirmasi password wajib diisi")]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "Konfirmasi password tidak cocok")]
        [Display(Name = "Konfirmasi Password Baru")]
        public string ConfirmPassword { get; set; } = "";
    }

    public void OnGet() { }

    public IActionResult OnPostProfile()
    {
        foreach (var key in ModelState.Keys.Where(k => k.StartsWith("Password.")).ToList())
            ModelState.Remove(key);

        if (!ModelState.IsValid) return Page();
        SuccessMessage = "Profil berhasil disimpan.";
        return Page();
    }

    public IActionResult OnPostPassword()
    {
        foreach (var key in ModelState.Keys.Where(k => k.StartsWith("Profile.")).ToList())
            ModelState.Remove(key);

        if (!ModelState.IsValid) return Page();
        SuccessMessage = "Password berhasil diubah.";
        return Page();
    }
}
