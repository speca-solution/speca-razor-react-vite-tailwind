namespace Speca.UI.Components
{
    /// <summary>
    /// Model partial Tailwind/_Pagination. UrlFor menerima nomor halaman dan
    /// mengembalikan URL lengkap (caller bertanggung jawab mempertahankan query lain:
    /// q, sort, dir, dst.).
    /// </summary>
    public sealed record PaginationViewModel(int Page, int TotalPages, Func<int, string> UrlFor);
}
