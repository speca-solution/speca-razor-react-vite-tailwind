# Layout & Theme — Konsep & Cara Pakai

Dua sumbu **independen** (orthogonal): **Layout** (struktur) dan **Theme** (rasa desain).
Jangan mencampurnya — sebuah halaman memilih satu Layout **dan** mewarisi Theme app.

## Sumbu Layout

| Sumbu | Nilai |
|---|---|
| **Chrome** | `Blank` (tanpa shell) · `App` (ada shell navigasi) |
| **Struktur nav** (App) | `Vertical` (sidebar) · `Horizontal` (topbar) · `MobileApp` (bottom-nav, *fase 2*) |
| **Responsif** | **bukan** tipe terpisah — **setiap** layout wajib responsif |

Layout yang ada (`Libs/UI/Pages/Shared/`):

| File | Untuk | JS entry |
|---|---|---|
| `_LayoutBlank.cshtml` | auth, error, print (konten di tengah) | `Entries/layouts/blank.js` |
| `_LayoutVertical.cshtml` | dashboard sidebar (default) | `Entries/layouts/vertical.js` |
| `_LayoutHorizontal.cshtml` | dashboard topbar | `Entries/layouts/horizontal.js` |

> **MobileApp** (bottom-nav, touch-first) = **fase 2**. Bukan sekadar responsif; perlu
> menandai "item primer" di model menu (`AddSpecaMenu`) + app-bar atas + konten full-bleed.

> **Landing ≠ Blank.** Halaman marketing biasanya butuh chrome sendiri (nav + footer +
> hero). Itu layout tersendiri (mis. `_LayoutLanding`), bukan Blank.

## Arsitektur — flat + `_Head` (bukan base nested)

Setiap layout adalah file **mandiri** (flat). Bagian `<head>` yang sama dibagikan lewat
partial **`_Head.cshtml`** (meta, preconnect, font, icon-css, theme-css, skrip anti-flash).
Skeleton `<html>/<body>/tail` (~10 baris stabil) diulang per layout — sengaja, demi
**kejelasan** (template diperluas orang lain; nested-layout + forwarding section = sumber bug).

`<head>` tiap layout:
```cshtml
<head>
    @await Html.PartialAsync("_Head")
    @RenderSection("Styles", false)
</head>
```

## Kontrak section (API layout)

Setiap layout meng-honor section yang sama agar halaman portabel antar-layout:

| Section | Fungsi | Catatan |
|---|---|---|
| `Styles` | CSS khusus halaman (`<head>`) | semua layout |
| `Breadcrumb` | di atas konten | Blank tak punya |
| `EndOfPage` | dialog/drawer/portal sebelum script | App layout |
| `Scripts` | JS akhir body | semua layout |

Data konvensi: `ViewBag.Title`, `ViewData["Style"]` (tema), `ViewData["LoadLucide"]`.

## Variasi = KONFIGURASI, bukan file baru

Aturan tegas (cegah ledakan file):

- **Variasi** (sidebar full/rail/mini, navbar sticky/static, mega-menu) → `ViewData` flag +
  modifier CSS pada **satu** file layout. Contoh aktif: `ViewData["StickyNavbar"]` (Horizontal).
- **File layout baru** HANYA jika skeleton DOM benar-benar berbeda.

## Menambah layout sendiri

- **Di app** (override/khusus app): buat `Apps/<App>/Pages/Shared/_LayoutX.cshtml`.
  Razor mencarinya **sebelum** `Libs/UI` → app bisa menimpa/menambah tanpa sentuh lib.
- **Di lib** (dipakai semua app): buat `Libs/UI/Pages/Shared/_LayoutX.cshtml`.
- Pakai `@await Html.PartialAsync("_Head")`, honor kontrak section di atas, dan muat
  JS entry-nya: `<vite-asset src="Libs/UI/Assets/Entries/layouts/x.js" />`.
- Pilih di halaman: `@{ Layout = "_LayoutX"; }` (atau global via `_ViewStart`).

## Theme = DEVELOPER choice (bukan end-user)

Theme (design language) `theme1` (Metronic) / `theme2` (Vuexy) dipilih **developer**, bukan
toggle end-user:

- **Global (build)**: edit satu baris `@import` di `Libs/UI/Assets/Themes/style.css`.
- **Per-section (server)**: `ViewData["Style"] = "style02";` di halaman/grup halaman.
- **App punya tema sendiri**: taruh `Apps/<App>/Assets/Themes/style.css` (masuk glob Vite).

Layout **tidak** meng-hardcode tema — selalu memuat `style.css` (tema pilihan app).

> **Theme ≠ Dark mode.** Dark mode adalah preferensi **user** (runtime toggle, persist
> localStorage, di `_Head`). Theme adalah keputusan developer (build/server). Dua sumbu beda.
> Tidak ada runtime *skin* toggle by default; bila perlu (white-label/showcase), itu pola
> opt-in terpisah (muat dua endpoint + toggle), bukan dipasang di layout.
