using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Speca.Portal.Pages;

public class RepeaterDemoModel : PageModel
{
    public sealed class Contact
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
    }

    /// <summary>Ter-bind dari field <c>Contacts[i].Name</c>/<c>Contacts[i].Phone</c> (re-index oleh repeater JS).</summary>
    [BindProperty]
    public List<Contact> Contacts { get; set; } = new();

    public bool Submitted { get; private set; }

    public void OnGet()
    {
        // Satu baris awal kosong agar form tampil.
        Contacts = new() { new Contact() };
    }

    public void OnPost()
    {
        Submitted = true;
        // Buang baris yang benar-benar kosong; sisanya = bukti binding List<T>.
        Contacts = Contacts
            .Where(c => !string.IsNullOrWhiteSpace(c.Name) || !string.IsNullOrWhiteSpace(c.Phone))
            .ToList();
        if (Contacts.Count == 0) { Contacts.Add(new Contact()); }
    }
}
