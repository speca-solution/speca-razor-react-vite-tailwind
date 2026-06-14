# Speca Platform

Template web application: **ASP.NET Core Razor Pages (.NET 10) + Vite 8 + React 19 + Tailwind CSS 4**.
**Theme** (kulit) dan **Layout** (struktur) adalah dua sumbu independen:

| Sumbu | Pilihan | Cara pakai di halaman |
|---|---|---|
| **Theme** = warna & rasa desain | `theme1` (biru, flat, bordered — referensi rasa Metronic) · `theme2` (ungu, soft, melayang — referensi rasa Vuexy) | dipilih saat build via endpoint `style.css` (`@import _theme1`/`_theme2`); pratinjau per-halaman `ViewData["Style"] = "style02"` |
| **Layout** = struktur & fungsi | `_Layout1` (sidebar vertikal + rail collapse) · `_Layout2` (horizontal topbar) | `Layout = "_Layout2"` (default _Layout1) |

Semua kombinasi valid (2×2), dan semua layout adaptif mobile (drawer + overlay).
Demo: `/` = Preview (theme1 vs theme2 berdampingan) · `/Dashboards/Metronic` & `/Dashboards/Vuexy` = komposisi tiap vendor · `/Layout2` = layout horizontal · `/ReactDemo` = Razor→React.

Metronic dan Vuexy dipakai murni sebagai *referensi desain* — tidak ada kode mereka yang dibundel.
Keputusan Tailwind-only (2026-06-12): stack Bootstrap dihapus demi satu jalur pemeliharaan;
versi dual-stack tersimpan di git tag `with-bootstrap`.
Roadmap lengkap: [BACKLOG.md](BACKLOG.md).

## Prasyarat

| Tool | Versi | Catatan |
|---|---|---|
| .NET SDK | 10.x | |
| Node.js | 22+ | |
| pnpm | 10.x | `npm install -g pnpm` — wajib, build MSBuild memanggilnya |

## Menjalankan (Development)

Cukup **F5 / `dotnet run`** di project `Apps/Portal`:

- MSBuild otomatis menjalankan `pnpm i` bila `node_modules` belum ada.
- ASP.NET men-spawn Vite dev server (`pnpm dev`) dan mem-proxy `/dist/*` ke sana (HMR aktif).
- Sertifikat HTTPS dev di-generate otomatis ke `certs/` (di-gitignore) via `dotnet dev-certs`.

Atau manual dari root: `pnpm dev` (Vite saja) + `dotnet run` terpisah.

> **Tips VS:** agar console/debugger ikut berhenti saat browser ditutup, aktifkan
> *Tools → Options → Projects and Solutions → Web Projects →
> "Stop debugger when browser window is closed"* (pengaturan per-user, bukan per-repo).

## Build & Publish (Production)

```bash
dotnet publish Apps/Portal/Speca.Portal.csproj -c Release -o out
```

Publish Release otomatis menjalankan `vite build` untuk app tersebut (env `SPECA_APP`
dari properti MSBuild `SpecaAppName` di csproj). Hasil Vite masuk ke `wwwroot/dist`
beserta `manifest.json`.

Build frontend semua app sekaligus: `pnpm build` (loop `Apps/*` via `scripts/build-apps.mjs`).
Type check: `pnpm typecheck`.

## Quality gates

- **Unit test** tag helper: `dotnet test Tests/Speca.Core.Tests/Speca.Core.Tests.csproj`
- **Smoke test** produksi (semua halaman + semua asset):
  jalankan app hasil publish, lalu `node scripts/smoke-test.mjs http://localhost:5599`
- **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)): typecheck → unit test →
  publish Release → smoke test, di setiap push/PR.

## Razor → React props

Model server di-serialize ke attribute `data-initial` pada elemen mount
(lihat `ReactDemo.cshtml.cs` + `ReactDemo.cshtml`), dibaca `main.tsx` dan diteruskan sebagai
props saat hydrate. Kontrak bentuk data: `DashboardData` (C#, camelCase via
`JsonSerializerDefaults.Web`) ↔ `DashboardData` (TypeScript, `App.tsx`).

## Cara memuat asset di halaman Razor

Satu atribut untuk dev dan production — path sumber relatif root solution:

```html
<vite-entry src="Apps/Portal/Assets/Entries/main.tsx" />
<vite-asset src="Libs/UI/Assets/Themes/style.css" />
```

- **Development**: URL `/dist/{src}` di-proxy ke Vite dev server.
- **Production**: nama file ber-hash di-resolve dari `wwwroot/dist/manifest.json`.
  Entry yang tidak ada di manifest → exception saat render (fail fast, bukan 404 senyap).
- CSS yang di-import oleh sebuah entry JS otomatis dirender sebagai `<link>`.

`vite-entry` dan `vite-asset` identik perilakunya; gunakan nama yang paling jelas maknanya.

## Konvensi entry Vite

Semua file di bawah `Assets/{Entries,Themes,Vendors}` (kecuali berawalan `_`) menjadi entry.
Nama output ditentukan aturan di `vite.config.ts`:

| File sumber | Key entry (nama output) |
|---|---|
| `Apps/Portal/Assets/Entries/main.tsx` | `apps/portal` *(main/index/core di-collapse ke folder)* |
| `Apps/Portal/Assets/Entries/checkout.tsx` | `apps/portal/checkout` |
| `Libs/UI/Assets/Themes/style.css` | `themes` *(style = main → nama folder)* |
| `Libs/UI/Assets/Themes/style02.css` | `themes/style02` |
| `Libs/UI/Assets/Entries/layouts/vertical.js` | `libs/ui/layouts/vertical` |
| `Libs/UI/Assets/Vendors/tabler-icons/style.css` | `vendors/tabler-icons` |

Aturan collapse: file bernama `main`, `index`, `core` (Entries), `style`, `theme` (Themes/Vendors),
atau yang sama dengan nama foldernya, memakai nama folder sebagai key.

> **Catatan struktur:** modul script (perilaku layout & komponen) ada di `Assets/Scripts/{layouts,components}`
> sebagai modul `_`-prefixed — di luar glob entry, jadi hanya ter-bundle saat di-import. Entry layout yang
> benar-benar dimuat halaman ada di `Assets/Entries/layouts/{vertical,horizontal,blank}.js`.

> Catatan: di `.cshtml` Anda selalu mereferensi **path sumber**, bukan key — key hanya
> menentukan struktur nama file di `dist/`.

## Menambah app baru

1. Copy `Apps/Portal` → `Apps/NamaBaru` (sesuaikan namespace & `Application:name` di appsettings).
2. Di csproj baru, set `<SpecaAppName>NamaBaru</SpecaAppName>`.
3. Selesai — `pnpm build` dan glob entry otomatis menangkapnya (`Apps/*`).

## Menambah halaman dengan React

1. Buat entry: `Apps/Portal/Assets/Entries/halamanku.tsx`.
2. Di Razor page: `<vite-entry src="Apps/Portal/Assets/Entries/halamanku.tsx" />`
   dan sediakan elemen mount (`<div id="root">`).

## Tailwind

Auto-detection **dimatikan** (`@import "tailwindcss" source(none)`) demi build deterministik;
sumber scan dideklarasikan eksplisit via `@source` di `Libs/UI/Assets/Themes/_theme1.css` & `_theme2.css`
(mencakup `*.cshtml` semua app/Libs + asset React). Class yang hanya muncul di `.cshtml`
tetap ter-generate.

## Struktur

```
Apps/Portal          → web app (Razor Pages), wwwroot/dist = output Vite
Libs/Core            → integrasi Vite: tag helper + dev-server middleware
Libs/UI              → Razor Class Library: layout, partial, asset theme
Libs/UI/Assets
  ├─ Entries/        → entry yang dimuat halaman (mis. layouts/{vertical,horizontal,blank}.js)
  ├─ Scripts/        → modul perilaku _prefixed: layouts/ (dark,sidebar,header,menu) + components/ (modal,datatable,...)
  ├─ Themes/         → endpoint style.css/style01/style02 + shared/ (komponen) + theme1/ + theme2/
  └─ Vendors/        → icon fonts + override vendor (tabler-icons, lucide, gridjs, datatables, ...)
```

## Menu sidebar (data-driven)

Menu didefinisikan sekali di `Program.cs` via `AddSpecaMenu(...)` — model `Speca.UI.Navigation.MenuItem`:
`Title`, `Url`, `Icon` (Tabler/Lucide), `IsHeading`, `Badge` + `BadgeVariant`
(primary/success/warning/danger), `Disabled`, `OpenInNewTab`, `MatchPrefix`
(`/products` aktif untuk `/products/123`), `Children` (rekursif, multi-level).
Opsi: `SpecaMenuOptions.AccordionSingleOpen` (default true — buka satu, saudara menutup).

Renderer vertical (`_Sidebar_Menu.cshtml`): rekursif tanpa batas kedalaman, accordion
`<details>` native + auto-scroll ke item aktif. Renderer horizontal (`_Menu_Horizontal.cshtml`):
**dibatasi 2 level dropdown** — level-3 dirender sebagai grup berlabel di dalam dropdown
(bukan flyout bersarang), demi kesederhanaan dan UX touch. Logika active ada di
`MenuItemExtensions` (ter-unit-test).

## Vendor frontend

| Apa | Detail |
|---|---|
| Icon | **Tabler** (`ti ti-*`, MIT) + **Lucide** (`icon-*`, ISC) — dua-duanya dimuat |
| Theme CSS | `Themes/style.css` (pilih `_theme1`/`_theme2`) → `shared/` (komponen var-based) + `theme1/`\|`theme2/` (token + override) |
| Theme JS | `Entries/layouts/{vertical,horizontal,blank}.js` → `Scripts/layouts/_base.js` — dark mode, drawer/rail sidebar, dropdown, Ctrl+/ |

Menambah vendor lain: install ke `Libs/UI`, buat `Assets/Vendors/<nama>/index.js`
yang meng-import-nya — otomatis jadi entry `vendors/<nama>`.

CSS icon Tabler/Lucide di-generate woff2-only oleh `node scripts/sync-icon-fonts.mjs` —
jalankan ulang setelah upgrade paket icon. File ber-prefix `_` tidak menjadi entry Vite.

## Tabel data (pola CRUD)

Halaman `/Tables` = pola resmi tabel CRUD: search + sort + paging **server-side** murni
(query-string `q/sort/dir/p`), komponen `.table`, dan partial reusable
`Tailwind/_Pagination` (model `PaginationViewModel`). Ganti sumber in-memory dengan
EF Core — bentuk Where/OrderBy/Skip/Take identik. Untuk kebutuhan grid berat
(export, kolom beku, ribuan baris client-side), datatables.net adalah opsi sadar
yang dipasang per-project (vendor entry), bukan bagian template.

## Lisensi

Semua kode theme (token, layout, partial, JS) **milik sendiri**. Dependensi yang dibundel
seluruhnya open source: Tabler Icons (MIT), Lucide (ISC). Metronic & Vuexy hanya
**referensi desain** (folder master terpisah, tidak dibundel).
