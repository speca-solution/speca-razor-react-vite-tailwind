namespace Speca.Core;

/// <summary>
/// Bendera build-time hasil pilihan template saat instantiate (lihat parameter <c>--content</c>).
/// Diletakkan di Libs/Core agar bisa dipakai BAIK oleh app (Apps/*) MAUPUN library tampilan
/// (Libs/UI) — mis. menyembunyikan tautan ke halaman showcase yang dibuang pada varian starter.
/// <para>
/// Simbol <c>isStarter</c> di-evaluasi template engine saat instantiate (cabang yang tak terpakai
/// dilucuti). Di SOURCE repo <c>isStarter</c> tak ter-define → <c>false</c> → source = demo penuh.
/// </para>
/// </summary>
public static class BuildFlags
{
    // Property (bukan const) agar @if(BuildFlags.IsStarter) di view tak memicu warning CS0162.
    public static bool IsStarter { get; } =
#if isStarter
        true;
#else
        false;
#endif
}
