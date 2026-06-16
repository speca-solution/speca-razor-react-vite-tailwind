using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Speca.Portal.Pages.Account;

public class LogoutModel(SignInManager<IdentityUser> signInManager) : PageModel
{
    public IActionResult OnGet() => Page();

    public async Task<IActionResult> OnPostAsync()
    {
        await signInManager.SignOutAsync();
        return RedirectToPage("/Index");
    }
}
