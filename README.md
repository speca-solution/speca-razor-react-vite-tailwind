# Speca Platform

Template web application: **ASP.NET Core Razor Pages (.NET 10) + Vite 8 + React 19** dengan
**4 layout** (2 stack × 2 design language), semua open source & terisolasi per-halaman:

| Layout | Design language | Stack | Pakai di halaman |
|---|---|---|---|
| Layout 1 | ala Metronic | Tailwind 4 | default (`_ViewStart`) |
| Layout 2 | ala Vuexy | Bootstrap 5 | `Layout = "Bootstrap/_Layout2"` |
| Layout 3 | ala Vuexy | Tailwind 4 | `Layout = "Tailwind/_Layout3"` |
| Layout 4 | ala Metronic | Bootstrap 5 | `Layout = "Bootstrap/_Layout4"` |

Metronic dan Vuexy dipakai murni sebagai *referensi desain* — tidak ada kode mereka yang dibundel.
Skin Tailwind via CSS variables (`.theme-vuexy`); skin Bootstrap via 2 entry SCSS dengan shell bersama.
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
- **Smoke test** produksi (5 halaman + semua asset + isolasi stack):
  jalankan app hasil publish, lalu `node scripts/smoke-test.mjs http://localhost:5599`
- **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)): typecheck → unit test →
  publish Release → smoke test, di setiap push/PR.

## Razor → React props

Model server di-serialize ke attribute `data-initial` pada elemen mount
(lihat `Index.cshtml.cs` + `Index.cshtml`), dibaca `main.tsx` dan diteruskan sebagai
props saat hydrate. Kontrak bentuk data: `DashboardData` (C#, camelCase via
`JsonSerializerDefaults.Web`) ↔ `DashboardData` (TypeScript, `App.tsx`).

## Cara memuat asset di halaman Razor

Satu atribut untuk dev dan production — path sumber relatif root solution:

```html
<vite-entry src="Apps/Portal/Assets/Entries/main.tsx" />
<vite-asset src="Libs/UI/Assets/Themes/tailwind/theme.css" />
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
| `Libs/UI/Assets/Themes/tailwind/theme.css` | `themes/tailwind` |
| `Libs/UI/Assets/Themes/tailwind/app/layouts/layout.js` | `themes/tailwind/layouts/layout` |
| `Libs/UI/Assets/Themes/bootstrap/layout4.scss` | `themes/bootstrap/layout4` |
| `Libs/UI/Assets/Vendors/tabler-icons/style.css` | `vendors/tabler-icons` |

Aturan collapse: file bernama `main`, `index`, `core` (Entries), `style`, `theme` (Themes/Vendors),
atau yang sama dengan nama foldernya, memakai nama folder sebagai key.

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
sumber scan dideklarasikan eksplisit via `@source` di `Libs/UI/Assets/Themes/tailwind/theme.css`
(mencakup `*.cshtml` semua app/Libs + asset React). Class yang hanya muncul di `.cshtml`
tetap ter-generate.

## Struktur

```
Apps/Portal          → web app (Razor Pages), wwwroot/dist = output Vite
Libs/Core            → integrasi Vite: tag helper + dev-server middleware
Libs/UI              → Razor Class Library: layout, partial, asset theme
Libs/UI/Assets
  ├─ Entries/        → entry milik library UI
  ├─ Themes/         → kode theme per stack: tailwind (theme.css + JS), bootstrap (SCSS + shell)
  └─ Vendors/        → vendor frontend (bootstrap, bootstrap-icons, tabler-icons, lucide)
```

## Menu sidebar (data-driven)

Menu didefinisikan sekali di `Program.cs` via `AddSpecaMenu(...)` (model: `Speca.UI.Navigation.MenuItem`
— `Title`, `Url`, `TailwindIcon`, `BootstrapIcon`, `IsHeading`, `Children`). Renderer per theme:
`Shared/Tailwind/_Sidebar_Menu.cshtml` dan `Shared/Bootstrap/_Menu.cshtml`. Active state otomatis dari path.

## Vendor frontend per theme

| Stack | CSS | JS | Icon |
|---|---|---|---|
| Tailwind | `Themes/tailwind/theme.css` — token + skin `.theme-vuexy` | `themes/tailwind/layouts/layout` (dark mode + drawer; accordion `<details>` native) | **Tabler** (`ti ti-*`, MIT) + **Lucide** (`icon-*`, ISC) |
| Bootstrap | `Themes/bootstrap/theme.scss` (Vuexy-look) & `layout4.scss` (Metronic-look), shell bersama `scss/_shell.scss` | `vendors/bootstrap` (MIT) | Bootstrap Icons (`bi bi-*`, MIT) |

Menambah vendor lain: install ke `Libs/UI`, buat `Assets/Vendors/<nama>/index.js`
yang meng-import-nya — otomatis jadi entry `vendors/<nama>`.

CSS icon Tabler/Lucide di-generate woff2-only oleh `node scripts/sync-icon-fonts.mjs` —
jalankan ulang setelah upgrade paket icon. File ber-prefix `_` tidak menjadi entry Vite.

## Lisensi

Semua kode theme (token, layout, partial, JS) **milik sendiri**. Dependensi yang dibundel
seluruhnya open source: Bootstrap (MIT), Bootstrap Icons (MIT), Tabler Icons (MIT),
Lucide (ISC). Metronic & Vuexy hanya **referensi desain** (folder master terpisah,
tidak dibundel). Tidak ada lagi aset berlisensi komersial di repo ini.
