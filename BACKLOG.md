# Speca Platform — Backlog Menuju Template Visual Studio 2026

> Target akhir: solution ini bisa di-instantiate sebagai project template di Visual Studio 2026 Community
> (via `dotnet new` template pack), stack **Tailwind 4** dengan dua design language
> (Layout 1 ala Metronic, Layout 2 ala Vuexy — semua kode milik sendiri, lisensi MIT/ISC),
> frontend **React**. (Riwayat: dual-stack Bootstrap sampai 2026-06-12, lihat tag `with-bootstrap`.)
>
> Referensi master (hanya referensi desain, tidak dibundel):
> - Metronic HTML: `d:\MASTER\ENVATO\METRONIC\metronic-v9.4.10\metronic-tailwind-html-demos`
> - Metronic React+Vite: `d:\MASTER\ENVATO\METRONIC\metronic-v9.4.10\metronic-tailwind-react-demos\typescript\vite`
> - Vuexy ASP.NET Razor: `d:\MASTER\ENVATO\VUEXY\vuexy-admin-v10.11.1\aspnet-core\Razor Pages\AspnetCoreFull`
> - Vuexy HTML (Bootstrap 5): `d:\MASTER\ENVATO\VUEXY\vuexy-admin-v10.11.1\html-version\Bootstrap5\vuexy-html-admin-template\full-version`

Status: ☐ belum ─ ◐ sedang ─ ☑ selesai

---

## EPIC 0 — Stabilisasi Production Path (P0, blocker semua epic lain)

Temuan audit 2026-06-11: build Debug & Vite sukses, tapi jalur production patah.

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E0-01 ☑ | **Fix entry 404 production**: `Index.cshtml` referensi `js/apps/portal/main-dist.js`, build menghasilkan `js/apps/portal-dist.js` (aturan `isMainFile` di vite.config meng-collapse `main.tsx` → `apps/portal`) | `dotnet publish -c Release` + jalankan exe → halaman Index me-render React app tanpa 404 di Network tab |
| E0-02 ☑ | **Fix URL relatif tag helper**: `GetContentRootPathVersionedUrl` return `dist/...` tanpa leading slash → rusak di nested route | Semua URL asset yang dihasilkan `<vite-entry>`/`<vite-asset>` selalu diawali `/`; uji di halaman `/a/b/c` |
| E0-03 ☑ | **Fix publish dari clone bersih**: target `CheckAndInstallPnpm` hanya jalan saat Debug; Release di mesin tanpa `node_modules` gagal | `git clone` segar → `dotnet publish -c Release` sukses tanpa langkah manual |
| E0-04 ☑ | **Cache hash versioning**: `GetWebRootPathVersionedUrl` hitung MD5 + buka file *setiap request, setiap asset* | Hash di-cache (IMemoryCache / static concurrent dict, invalidasi by last-write-time); atau diganti `IFileVersionProvider` bawaan |
| E0-05 ☑ | **Keluarkan private key dari git**: `certs/*.key` + `.pem` ter-commit | `certs/` masuk `.gitignore`, file di-untrack; vite.config sudah auto-generate kalau hilang (verifikasi tetap jalan) |
| E0-06 ☑ | Bug kecil: `className` → `class` di Index.cshtml:29; `"node_modules"` → `"exclude"` di tsconfig.json; namespace `Extentions` → `Extensions` | Build bersih, tidak ada sisa typo |

## EPIC 1 — Asset Pipeline Mateng (P1)

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E1-01 ☑ | **Manifest-based tag helper** (menghilangkan akar masalah E0-01): aktifkan `manifest: true` di Vite; tag helper jadi satu atribut `src="Apps/Portal/Assets/Entries/main.tsx"`, di production resolve via `manifest.json` (termasuk CSS ter-split + hash di nama file) | Tidak ada lagi atribut `srcpro` manual di seluruh .cshtml; salah ketik path = error saat render, bukan 404 diam-diam |
| E1-02 ☑ | **Parameterisasi multi-app**: vite.config hardcode `Apps/Portal` (outDir, appsettings, cert) padahal workspace dirancang `Apps/*` | Menambah `Apps/Admin` cukup: copy folder + daftar di satu tempat (array/auto-scan); build menghasilkan dist per-app |
| E1-03 ☑ | **Hapus dead config**: blok `content:{files:[...]}` di vite.config bukan opsi Vite/Tailwind v4 (scan cshtml jalan via auto-detection). Ganti dengan `@source` eksplisit di styles.css agar tidak bergantung pada heuristik | Scan source terdokumentasi & eksplisit; class cshtml-only tetap ter-generate (uji: `top-[15%]`) |
| E1-04 ☑ | **Pangkas Keenicons**: saat ini 4 varian × ttf/woff/svg ≈ 6,9 MB, tanpa woff2 | Hanya varian terpakai + woff2; total aset font < 1 MB |
| E1-05 ☑ | **Hilangkan cast `as any`** di defineConfig; ketik config dengan benar (Vite 8/rolldown types) | `tsc --noEmit` hijau atas vite.config.ts |
| E1-06 ☑ | **Dokumentasikan konvensi entry naming** (aturan `main`/`index`/`core`/`style` collapse ke nama folder) — saat ini hanya hidup di regex | README bagian "Entry conventions" + tabel contoh path → output |
| E1-07 ☑ | Bersihkan `publish/` dari root repo (hasil publish manual) + pastikan masuk .gitignore | Root repo bersih |

## EPIC 2 — Integrasi Theme: Tailwind & Bootstrap (P1)

> **PIVOT 2026-06-11:** theme resmi template = **Tailwind (+KTUI, MIT)** dan **Bootstrap 5 (MIT)**.
> Metronic & Vuexy turun status menjadi *referensi desain* (tidak dibundel).
> Eksekusi: SCSS/JS Vuexy & boxicons dihapus; `Themes/vuexy` → `Themes/bootstrap` (Bootstrap murni +
> layout SCSS/JS milik sendiri); `Themes/metronic` → `Themes/tailwind`; partial `Shared/Metronic|Vuexy`
> → `Shared/Tailwind|Bootstrap`; boxicons → Bootstrap Icons; properti menu → `TailwindIcon|BootstrapIcon`.
> Konsekuensi: E2-07 selesai (semua bundel MIT); item baru E2-08 (sisa kode derived Metronic).

**Isolasi per-layout tetap berlaku:** Tailwind preflight vs Bootstrap reboot saling menimpa —
satu halaman hanya boleh memuat satu stack CSS (diverifikasi E2-06).

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E2-01 ☑ | **Selesaikan Metronic**: port partial yang masih hardcoded (sidebar/header/footer/menu di `Libs/UI/Pages/Shared/Metronic`) jadi data-driven (menu dari model/config, bukan HTML statis 1000+ baris) | Menu sidebar didefinisikan di satu tempat (JSON/C# model); menambah item menu tanpa edit partial |
| E2-02 ☑ | **4 layout (2 stack × 2 design)** — *selesai 2026-06-11*: L1 Metronic-look/Tailwind, L2 Vuexy-look/Bootstrap, L3 Vuexy-look/Tailwind (skin `.theme-vuexy`), L4 Metronic-look/Bootstrap (`layout4.scss`); shell & partial dipakai bersama | 4 halaman demo, semua asset 200, isolasi stack lolos ✓ |
| E2-03 ☑ | **Vuexy — pipeline SCSS**: compile `scss/core.scss` Vuexy via Vite (sass-embedded sudah ada di devDeps) ke `Assets/Themes/vuexy/`; JANGAN bawa gulp/webpack Vuexy | `vendors/vuexy` + `themes/vuexy` muncul di output build Vite; tidak ada gulp di solution |
| E2-04 ☑ | **Vuexy — layout Razor**: port `_Layout` dari referensi `aspnet-core/Razor Pages/AspnetCoreFull/Pages` ke `Libs/UI/Pages/Shared/Vuexy/` memakai `<vite-entry>`/`<vite-asset>` | Halaman demo Vuexy render benar (vertical menu layout) dari publish Release |
| E2-05 ☑ | **Vuexy — vendors**: pilih subset vendor JS (form-validation, fullcalendar, dll dari package.json Vuexy) yang masuk template; sisanya didokumentasikan cara menambah | Daftar vendor terpilih di README; bundle vendor Vuexy < 500 kB gzip total |
| E2-06 ☑ | **Uji isolasi theme**: halaman Metronic tidak memuat CSS/JS Vuexy dan sebaliknya | Network tab: 0 request silang antar-theme; visual kedua demo tidak rusak |
| E2-07 ☑ | Lisensi — *selesai via pivot*: semua yang dibundel kini MIT (Bootstrap, Bootstrap Icons, KTUI); Metronic/Vuexy hanya referensi | Catatan lisensi di README ✓ |
| E2-08 ☑ | **Bersihkan kode derived Metronic** — *selesai via rewrite 2026-06-11*: KTUI + core JS + components CSS dibuang seluruhnya; theme Tailwind kini Tailwind 4 murni, 100% tulisan sendiri (token warna ala Metronic, accordion `<details>` native, JS layout ~40 baris) | Tidak ada kode KeenThemes di repo ✓ |
| E2-09 ☑ | Icon set — *selesai 2026-06-11*: Keenicons dihapus, diganti **Tabler Icons (MIT)** + **Lucide (ISC)** untuk jalur Tailwind; Bootstrap Icons (MIT) tetap di jalur Bootstrap | Semua icon set berlisensi aman ✓ |
| E2-11 ☑ | **Widget demo** — *2026-06-11*: partial `Tailwind/_DemoWidgets` & `Bootstrap/_DemoWidgets` (KPI, tabel order, aktivitas, progress; markup sendiri, gaya referensi) dipakai keempat layout; komponen `.card`/`.badge-*` Tailwind + skin vuexy | 4 halaman menampilkan widget, smoke lulus ✓ |
| E2-10 ☑ | Pruning font icon — *selesai 2026-06-11*: `scripts/sync-icon-fonts.mjs` men-generate css woff2-only (`_lucide.css`, `_tabler-icons.css`) + vendored woff2; dist 26 MB → 2,1 MB | dist 2,1 MB, css icon hanya referensi woff2, 0 regresi ✓ |

> **PIVOT FINAL 2026-06-12 — Tailwind-only.** Setelah perbandingan terukur (CSS 5,4 kB vs 31 kB×2 gzip;
> LOC partial 424 vs 425 = pemeliharaan 2×; 2 bug spesifik-Bootstrap vs 1 spesifik-Tailwind),
> stack Bootstrap **dihapus**: Themes/bootstrap, Vendors/bootstrap*, Shared/Bootstrap, halaman L2/L4 lama,
> deps bootstrap/popper/bootstrap-icons/sass-embedded, properti BootstrapIcon.
> Vuexy-look (eks-Layout3, skin .theme-vuexy) di-rename menjadi **Layout 2**.
> Kondisi dual-stack diabadikan di git tag `with-bootstrap`.

> **RESTRUKTUR 2026-06-12 — Theme × Layout dipisah.** Theme = kulit (token warna/rasa):
> `theme1` & `theme2` (tanpa nama brand; referensi visual Metronic/Vuexy). Layout = struktur/fungsi:
> `_Layout1` (sidebar vertikal) & `_Layout2` (horizontal topbar, baru), keduanya adaptif mobile.
> Pilihan independen per halaman: `ViewData["Theme"]` + `Layout`. Referensi pengembangan
> layout berikutnya: Metronic demo1–10 / layout Vuexy.

## EPIC 3 — Developer Experience & Skala (P2)

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E3-01 ☑ | README lengkap: prasyarat (pnpm, .NET 10), cara run dev (F5), cara tambah app/halaman/entry, cara pilih theme, cara deploy | Developer baru bisa onboard tanpa bertanya |
| E3-02 ☑ | Rapikan `Program.cs`: hapus `UseEndpoints`+pragma (pakai `app.MapRazorPages()` top-level), klarifikasi `UseStaticFiles` vs `MapStaticAssets` (pilih satu strategi), `UseAuthentication` placeholder berkomentar | Tidak ada pragma suppress; pipeline middleware terdokumentasi |
| E3-03 ☑ | Hapus folder placeholder kosong (`Libs/Core/Areas/Core/Page1`, `Libs/UI/Areas/Metronic` jika tak dipakai) atau isi dengan contoh nyata | Tidak ada file "Page1" di template final |
| E3-04 ☑ | **Keputusan Vue**: glob entry menangkap `*.vue` tapi tidak ada plugin Vue + preamble React di-hardcode di tag helper. Pilih: (a) dukung penuh (tambah `@vitejs/plugin-vue`, preamble kondisional) atau (b) hapus jejak Vue | Tidak ada jalur setengah jadi; kalau (a): demo Vue page jalan di dev+prod |
| E3-05 ☑ | Contoh pola integrasi Razor↔React yang nyata: pass model server → props React (json script tag / data-attribute), bukan hanya "Hello App" | 1 halaman demo CRUD kecil: Razor render shell + data awal, React hydrate |
| E3-06 ◐ | CI (GitHub Actions): clone bersih → `pnpm i` → `dotnet publish -c Release` → smoke test (jalankan exe, curl `/`, assert 200 + tidak ada 404 asset) | Badge hijau di README; mencegah regresi E0-01/E0-03 |
| E3-07 ☑ | Unit test minimal untuk `ViteTagHelpers` (dev/prod URL generation, leading slash, versioning) | `dotnet test` di CI |

## EPIC 4 — Paket Template Visual Studio 2026 (P2, setelah E0–E2 selesai)

Pendekatan yang disarankan: **`dotnet new` template pack** (folder `.template.config/template.json`),
bukan VSIX — VS 2022+ (termasuk 2026) menampilkan template `dotnet new` langsung di dialog
New Project, lintas-platform, dan jauh lebih mudah dirawat.

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E4-01 ☐ | Buat `.template.config/template.json` dengan symbol/parameter: `--theme` (metronic/vuexy/none), `--frontend` (react/none), `--AppName` (rename Speca.Portal → {AppName}) | `dotnet new install .` lalu `dotnet new speca-platform -n MyApp --theme metronic` menghasilkan solution yang langsung build |
| E4-02 ☐ | Conditional content: file/folder theme yang tidak dipilih tidak ikut ter-generate (pakai `sources.modifiers` + `#if` symbol di csproj/cshtml) | Instance `--theme vuexy` tidak berisi folder Metronic sama sekali, dan sebaliknya |
| E4-03 ☐ | Ganti semua identifier "Speca"/"speca.portal" dengan source name substitution; sertakan rename cert name, appsettings `Application:name`, pnpm package names | `grep -ri speca` di hasil instantiate = 0 hit |
| E4-04 ☐ | Exclude dari paket template: `node_modules`, `wwwroot/dist`, `publish/`, `certs/`, `.vs/`, `bin/obj`, `*.user` | Ukuran paket .nupkg < 5 MB (tanpa aset theme) atau terdokumentasi jika theme disertakan |
| E4-05 ☐ | Uji matrix instantiate di VS 2026 Community: New Project → parameter UI muncul (theme dropdown) → F5 jalan → publish jalan, untuk tiap kombinasi theme×frontend | Checklist matrix 100% lulus, didokumentasikan |
| E4-06 ☐ | Pack & distribusi: `dotnet pack` template pack → nupkg privat (folder/feed lokal atau GitHub Packages) | Tim bisa `dotnet new install Speca.Templates` dari feed |
| E4-07 ☐ | Post-action: instruksi/automation `pnpm install` setelah instantiate (template.json postActions atau instruksi README yang muncul) | Developer tidak bingung kenapa build pertama gagal |

---

## EPIC 5 — Sistem Menu & Navigasi (P1, sebelum komponen & layout lanjutan)

> Hasil audit referensi 2026-06-12 (markup `dist/demo1` Metronic & template vertical/horizontal Vuexy):
> Metronic — accordion bersarang 3+ level (23 blok), toggle hybrid `accordion|lg:dropdown`, trigger
> `click|lg:hover`, single-open (`expand-all=false`), 24 badge, 120 bullet, separator, tooltip rail.
> Vuexy — nested max 3 level, 22 badge, 12 heading, 1 disabled, 31 `target=_blank`, menu.js
> (`closeChildren`, `showDropdownOnHover`, `scrollToActive`).
> **Baseline Speca saat ini:** 2 level, tanpa badge/disabled/external/single-open/scrollToActive;
> horizontal click-only. (Heading, icon, active, drawer, rail+hover-expand, scrollbar halus: sudah ada.)

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E5-01 ☑ | **Rekursi multi-level (≥3)**: renderer vertical jadi rekursif (`<details>` bersarang, indent bertingkat); horizontal: level-3 sebagai flyout samping ATAU dibatasi 2 level dengan keputusan terdokumentasi | Menu demo 3 tingkat tampil & berfungsi di vertical (buka/tutup/active); perilaku horizontal terdokumentasi di README |
| E5-02 ☑ | **Badge item**: model `Badge` (teks) + `BadgeVariant` (primary/success/warning/danger); render di vertical (induk & anak) dan dropdown horizontal; disembunyikan saat rail icon-only | Item demo badge angka ("5") & teks ("Baru") tampil benar di kedua renderer + tidak merusak rail |
| E5-03 ☑ | **Disabled & link eksternal**: model `Disabled` (non-klik, redup, anak tak bisa dibuka) + `OpenInNewTab` (`target=_blank rel=noopener` + icon kecil) | 2 item demo; disabled tidak navigasi & tidak ada hover state; eksternal buka tab baru |
| E5-04 ☑ | **Single-open accordion** ala referensi: membuka satu `<details>` menutup saudaranya (nested tidak menutup leluhur); opsi `SpecaMenuOptions.AccordionSingleOpen` (default true) | Buka A lalu B → A menutup; set opsi false → perilaku multi-open kembali |
| E5-05 ☑ | **scrollToActive**: saat load, sidebar auto-scroll ke item aktif (`scrollIntoView`, block nearest) | Menu lebih panjang dari viewport → item aktif terlihat tanpa scroll manual |
| E5-06 ☑ | **Hover-trigger horizontal (desktop)**: dropdown terbuka saat hover dengan delay tutup kecil; click tetap bekerja (touch) | Hover buka/tutup mulus di desktop; di layar sentuh click tetap berfungsi; tidak ada dropdown "nyangkut" |
| E5-07 ☑ | ~~Tooltip saat rail~~ — **dibatalkan dengan alasan terdokumentasi**: rail kita hover-expand (pola Vuexy), hover icon langsung melebarkan sidebar sehingga tooltip tidak pernah sempat tampil; tooltip hanya relevan bila hover-expand dimatikan (pola Metronic) | Keputusan tercatat; tidak ada kode mati |
| E5-08 ☑ | **Active prefix-matching**: opsi `MatchPrefix` per item — `/products/123` mengaktifkan item `/products` | Halaman anak route menandai induknya active; exact-match tetap default |
| E5-09 ☐ | Mega menu multi-kolom (horizontal) — *prioritas terendah, kerjakan bila ada kebutuhan nyata* | Dropdown multi-kolom dengan heading per kolom di _Layout2 |

**Sprint usulan:** Sprint A = E5-01…05 + E5-08 + update menu demo Program.cs (3 level, badge, disabled, eksternal);
Sprint B = E5-06…07; E5-09 ditunda sampai dibutuhkan.
**Catatan jujur:** E5-01 menyentuh kedua renderer dan berisiko regresi rail/drawer — wajib smoke + cek visual;
E5-06 rawan edge-case touch/hover hybrid (laptop layar sentuh) — uji manual diperlukan.

## Urutan eksekusi yang disarankan

1. **Sprint 1 (E0 semua)** — production path hidup. Tanpa ini, semua di atasnya dibangun di fondasi patah.
2. **Sprint 2 (E1-01, E1-02, E1-03)** — manifest tag helper + multi-app. Ini mengubah kontrak antar file .cshtml, jadi kerjakan SEBELUM port theme (agar layout Vuexy/Metronic baru langsung pakai kontrak final, tidak perlu migrasi dua kali).
3. **Sprint 3–4 (E2)** — Metronic dirapikan, Vuexy masuk. Paling besar effort-nya; Vuexy SCSS via Vite adalah eksperimen pertama yang harus di-spike dulu (E2-03) sebelum komit penuh.
4. **Sprint 5 (E3)** — docs, CI, polish.
5. **Sprint 6 (E4)** — packaging template. Dikerjakan terakhir karena conditional content bergantung pada struktur final.

## Risiko utama (jujur)

- **Lisensi theme (E2-07)** — risiko legal, bukan teknis. Putuskan model distribusi sebelum E2 dimulai.
- **Vuexy di Vite** — gulp pipeline Vuexy punya langkah build khusus (fonts, copy tasks, build-config.js per-environment). Spike E2-03 bisa mengungkap ketidakcocokan SCSS (mis. path font/asset relatif). Alokasikan waktu eksplorasi.
- **Dua CSS framework satu solution** — disiplin isolasi per-layout harus dijaga oleh konvensi + test (E2-06), karena pelanggarannya tidak error, hanya tampilan rusak halus.
- **`SpaServices.Extensions`** — masih disupport .NET 10 tapi pola lama; kalau suatu saat dihapus dari ASP.NET, jalur dev-proxy perlu diganti (alternatif: jalankan `vite dev` terpisah via Aspire/launch profile). Bukan blocker sekarang.
