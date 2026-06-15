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
> **UPDATE 2026-06-13:** theme dipisah jadi endpoint terpisah — `style.css` memilih `_theme1`/`_theme2`
> (shared-core: `shared/` komponen var-based + `theme1/`,`theme2/` token+override). Pilih saat build
> (bukan toggle runtime); pratinjau per-halaman `ViewData["Style"]="style02"`. Script dipisah ke
> `Assets/Scripts/{layouts,components}` + entry `Assets/Entries/layouts/`. Referensi pengembangan
> layout berikutnya: Metronic demo1–10 / layout Vuexy.

## EPIC 3 — Developer Experience & Skala (P2)

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E3-01 ☑ | README lengkap: prasyarat (pnpm, .NET 10), cara run dev (F5), cara tambah app/halaman/entry, cara pilih theme, cara deploy | Developer baru bisa onboard tanpa bertanya |
| E3-02 ☑ | Rapikan `Program.cs`: hapus `UseEndpoints`+pragma (pakai `app.MapRazorPages()` top-level), klarifikasi `UseStaticFiles` vs `MapStaticAssets` (pilih satu strategi), `UseAuthentication` placeholder berkomentar | Tidak ada pragma suppress; pipeline middleware terdokumentasi |
| E3-03 ☑ | Hapus folder placeholder kosong (`Libs/Core/Areas/Core/Page1`, `Libs/UI/Areas/Metronic` jika tak dipakai) atau isi dengan contoh nyata | Tidak ada file "Page1" di template final |
| E3-04 ☑ | **Keputusan Vue**: glob entry menangkap `*.vue` tapi tidak ada plugin Vue + preamble React di-hardcode di tag helper. Pilih: (a) dukung penuh (tambah `@vitejs/plugin-vue`, preamble kondisional) atau (b) hapus jejak Vue | Tidak ada jalur setengah jadi; kalau (a): demo Vue page jalan di dev+prod |
| E3-05 ☑ | Contoh pola integrasi Razor↔React yang nyata: pass model server → props React (json script tag / data-attribute), bukan hanya "Hello App" | 1 halaman demo CRUD kecil: Razor render shell + data awal, React hydrate |
| E3-06 ☑ | CI (`.github/workflows/ci.yml`): **job 1** `build-test-smoke` (pnpm i frozen → typecheck → unit test → publish Release → smoke semua halaman + gRPC `rpc-smoke.ts`); **job 2** `template` (menjaga `dotnet new`: instantiate **proto**+rename & **none**, assert grep speca/portal=0 + tanpa Contracts/AddGrpc, lalu build keduanya). Badge CI di README. | Badge di README; CI menjaga regresi E0-01/E0-03 + rename + gRPC + data-comm ✓ (perintah job terverifikasi lokal; runner GitHub jalan saat push) |
| E3-07 ☑ | Unit test minimal untuk `ViteTagHelpers` (dev/prod URL generation, leading slash, versioning) | `dotnet test` di CI |

## EPIC 4 — Paket Template Visual Studio 2026 (P2, setelah E0–E2 selesai)

Pendekatan yang disarankan: **`dotnet new` template pack** (folder `.template.config/template.json`),
bukan VSIX — VS 2022+ (termasuk 2026) menampilkan template `dotnet new` langsung di dialog
New Project, lintas-platform, dan jauh lebih mudah dirawat.

> **STATUS 2026-06-15:** template `dotnet new` jalan & terverifikasi end-to-end untuk fokus
> user = **rename nama solution + rename nama project app**. Metadata di `.template.config/`
> (`template.json` + `dotnetcli.host.json`); panduan di `TEMPLATE.md`. Diuji `-n Acme --app-name Web`:
> instantiate → `grep -ri speca|portal` = 0 → `dotnet publish -c Release` sukses → run + smoke **14/14**.
> Prasyarat yang dikerjakan: env build di-generikkan `SPECA_APP`→`BUILD_APP_NAME` (hapus brand uppercase).
> Sisa (E4-02/05/06) = peningkatan opsional, bukan blocker pemakaian.

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E4-01 ☑ | `.template.config/template.json` + `dotnetcli.host.json`: `sourceName=Speca` (+ form lowercase `nameLower`) untuk **nama solution** lewat `-n`; symbol `AppName` (`replaces`+`fileRename` `Portal`, + `appNameLower`) untuk **nama project app** lewat `--app-name`/`-a` | `dotnet new install .` lalu `dotnet new speca-platform -n Acme -a Web` → solution langsung **publish sukses** ✓ |
| E4-02 ◐ | Conditional content (`sources.modifiers` + `#if` symbol). **Mekanisme TERBUKTI jalan via E9-06** (`--data-comm proto\|none`). Untuk theme belum diterapkan (theme1/theme2 dipilih saat build via `style.css`, prioritas rendah). | pola conditional content tervalidasi ✓; penerapan ke theme menyusul bila perlu |
| E4-03 ☑ | Source name substitution menyeluruh: namespace, csproj/slnx/workspace, `appsettings name`, scope `package.json`, prefix JS/CSS milik sendiri (`specaToast`/`.speca-scroll`/key localStorage), cookie `speca.antiforgery`, CI workflow | `grep -ri speca` & `grep -riw portal` di hasil = **0** ✓ |
| E4-04 ☑ | Exclude: `node_modules`, `wwwroot/dist`, `_pub`/`publish/`, `certs/`, `.vs`, `.git`, `bin/obj`, `*.user`, `pnpm-lock.yaml`, `BACKLOG.md`, `.template.config` | exclude aktif & terverifikasi; nupkg → E4-06 (snippet pack di `TEMPLATE.md`) |
| E4-05 ☐ | Uji matrix instantiate di **VS 2026 Community** (GUI New Project). *Belum diuji manual di GUI; jalur CLI sudah lulus & VS membaca template yang sama.* | Checklist matrix GUI lulus |
| E4-06 ☑ | Pack & distribusi `.nupkg`: `packaging/Speca.Templates.csproj` (`PackageType=Template`). Terverifikasi: pack → nupkg **1,1 MB** → `dotnet new install <nupkg>` → instantiate `-n FromPkg -a Web` → publish + smoke 15/15 + gRPC ✓. (Temuan: `wwwroot/assets/media` 23 MB = demo mati 0 referensi kode → **dihapus dari repo**; verifikasi pasca-hapus: publish + smoke 15/15 + /Settings & favicon 200.) | `dotnet new install` dari nupkg → solution langsung build ✓ |
| E4-07 ☑ | Post-action: `dotnet restore` otomatis (postAction `210D431B`, kondisional `--no-restore`); `pnpm install` via manual-instruction + otomatis saat build pertama (target MSBuild `Exec pnpm i` bila `node_modules` hilang) | build pertama tidak gagal diam-diam ✓ |

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
| E5-09 ☑ | Mega menu multi-kolom (horizontal) — *2026-06-13* | `RenderMega` di `_Menu_Horizontal.cshtml`: panel full-width `grid sm:grid-cols-2 lg:grid-cols-3` + heading per kolom (`border-b … uppercase`) + link kaya (ikon+judul+Description) ✓ |

**Sprint usulan:** Sprint A = E5-01…05 + E5-08 + update menu demo Program.cs (3 level, badge, disabled, eksternal);
Sprint B = E5-06…07; E5-09 ditunda sampai dibutuhkan.
**Catatan jujur:** E5-01 menyentuh kedua renderer dan berisiko regresi rail/drawer — wajib smoke + cek visual;
E5-06 rawan edge-case touch/hover hybrid (laptop layar sentuh) — uji manual diperlukan.

## EPIC 6 — Komponen Dasar (P1, gap terbesar pasca Tailwind-only)

> Audit referensi 2026-06-12 — frekuensi pemakaian di Metronic demo1 (seluruh halaman):
> form controls **kt-checkbox 1616 / kt-switch 1057 / kt-input 1000 / form-label 533 / radio 394**,
> tabs 1033, drawer 731, select custom 684, datatable 656, modal 378, tooltip 111, accordion 168,
> password-toggle 20. Vendor Vuexy utk fungsi setara: @form-validation, bootstrap-select, flatpickr,
> datatables.net, sweetalert2, dst.
> **Baseline Speca:** card/badge/btn/dropdown/accordion-menu/scrollable sudah ada; form, modal,
> toast, tabs, tooltip, drawer generik, select/datepicker advanced: belum.
> **Catatan jujur penting:** sejak jQuery dihapus, validasi client-side bawaan Razor Pages
> (jquery-validation) tidak tersedia — E6-02 wajib memilih strategi pengganti.

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E6-01 ☑ | **Form controls** (pemakaian tertinggi di referensi): `.input`, `.textarea`, `.select` (native), `.checkbox`, `.radio`, `.switch`, `.form-label`, `.form-hint`, state error/disabled — token-based, dark & theme2 aman | Halaman demo form menampilkan semua kontrol di 2 theme × 2 mode tanpa rusak |
| E6-02 ☑ᴺ | **Strategi validasi client-side**: integrasi `aspnet-client-validation` (MIT, tanpa jQuery) sebagai vendor entry + styling `.field-validation-error`/`input-validation-error` selaras token | Form demo dengan DataAnnotations tervalidasi di browser tanpa submit; pesan tampil dengan style template |
| E6-03 ☑ | **Modal** berbasis `<dialog>` native + helper `data-modal-open/dismiss` + pola confirm | Modal demo buka/tutup (tombol, backdrop, Esc), focus-trap bawaan dialog, confirm mengembalikan aksi |
| E6-04 ☑ | **Toast** JS kecil milik sendiri: `window.specaToast(pesan, variant)`, stack kanan-atas, auto-dismiss + tombol tutup | Demo memunculkan 4 variant; menumpuk rapi; hilang otomatis |
| E6-05 ☑ | **Tabs** (`data-tab-toggle`) — 1033x dipakai referensi | Tab demo berpindah panel, state active benar, bisa >1 grup per halaman |
| E6-06 ☑ | **Tooltip CSS-only** (`data-tooltip` + posisi atas/bawah) untuk kasus sederhana | Hover elemen ber-`data-tooltip` menampilkan label; tanpa JS |
| E6-07 ☑ | **Drawer generik** (panel kanan utk filter/detail — 731x di referensi): `data-drawer-toggle` + overlay, reuse pola sidebar | Drawer demo buka/tutup dari kanan, Esc menutup, scroll body terkunci |
| E6-08 ☑ | **Select advanced & datepicker** — keputusan vendor MIT: Tom Select + flatpickr sebagai vendor entry **opsional** (terdokumentasi, tidak dimuat default) | Demo opsional jalan; bundle default tidak membengkak |
| E6-09 ☑ | **Strategi tabel data CRUD**: komponen `.table` + pagination partial server-side milik sendiri; datatables.net = opsi terdokumentasi | Tabel demo sort/paging server-side di 1 halaman contoh |
| E6-10 ☑ | **Halaman /Components** memamerkan semua komponen (jadi galeri hidup + masuk smoke test) | Halaman 200 di smoke; semua komponen tampil |
| E6-11 ☑ | **Primitif kecil** (hasil audit lengkap: ui-alerts, progress, spinners, avatar, pagination-breadcrumbs, divider di referensi): `.alert-*`, `.progress`, `.spinner`, `.avatar`, `.pagination`, breadcrumb partial, `.divider`, `.skeleton` — CSS-only, token-based | Semua tampil di /Components, aman di 2 theme × dark |

ᴺ **Keputusan FormValidation.io (2026-06-12):** dievaluasi vs aspnet-client-validation — unggul di validator eksotis, async & i18n, TAPI komersial & memecah sumber kebenaran. **Update hari yang sama:** diganti ENGINE MILIK SENDIRI `speca-validation` (Libs/UI/Assets/Entries/validation.js, ~180 baris): baca data-val-* DataAnnotations, live blur/input, status sukses/error, async [PageRemote], creditcard Luhn, registry addValidator() extensible. Dependensi aspnet-client-validation dihapus — validasi kini 100% kode sendiri.

**Sprint usulan:** Sprint A = E6-01…05 + E6-10 (inti CRUD); Sprint B = E6-06…08; E6-09 sprint tersendiri.
**Catatan jujur:** E6-02 paling berisiko (integrasi lifecycle validasi ASP.NET); E6-03 `<dialog>` butuh
fallback perilaku scroll-lock; komponen kita belum diaudit aksesibilitas seketat KTUI/Bootstrap — 
diandalkan pada elemen native (`dialog`, `details`, input asli) sebisa mungkin justru karena itu.

### Inventori UI lengkap — audit kanonik 2026-06-12 (KTUI 50 komponen + Vuexy scss/_components & extended pages)

**Sudah ada di Speca (24):** btn (6 variant+sm+icon) · badge (6) · card · input · textarea · select ·
checkbox · radio · switch · form-label/hint · validasi (engine sendiri) · alert (4) · progress ·
spinner · avatar · pagination (+partial) · divider/separator · skeleton · table (+pola CRUD) · tabs ·
tooltip · modal · drawer/offcanvas · dropdown · toast · menu (vertikal+horizontal) · scrollable ·
theme-switch (dark) — *vendor opsional:* select-advanced (Tom Select) · datepicker (flatpickr).

**Sudah direncanakan (EPIC 7):** charts · upload/dropzone · editor · range-slider · sortable ·
stepper/wizard · clipboard · fullcalendar · (deferred: carousel, kanban, tour, maps).

| ID | Item baru hasil inventori | Acceptance Criteria |
|----|------|---------------------|
| E6-12 ☑ | **Batch primitif-2** (semua kecil, ditemukan di katalog KTUI/Vuexy, belum ada): accordion generik (`<details>` + class), popover (klik, konten kaya — reuse pola dropdown), kbd, input-number (+/-), toggle-password, rating bintang, timeline (formalisasi pola Aktivitas), blockui/loading-overlay, breadcrumb partial, button-group | Semua tampil di /Components, 2 theme × dark aman |
| E7-10 ☐ | **Form repeater** (KTUI repeater / jquery.repeater Vuexy — versi sendiri tanpa jQuery): duplikasi baris form dinamis + re-index name utk model binding ASP.NET | Demo baris kontak dinamis ter-bind benar ke List<T> saat POST |
| E8-06 ☐ | **Image-input** (upload avatar dgn preview — KTUI image-input / Vuexy account) — digabung ke halaman settings E8-03 | Preview sebelum upload, fallback inisial |
| — | **Ditolak/deferred dgn alasan:** list-group (utilities cukup) · context-menu, pin-input, scrollspy, scrollto, sticky, reparent (niche, di luar pola CRUD — adakan saat ada kebutuhan nyata) · datatable JS KTUI (sudah diputuskan server-side, E6-09) | tercatat |

## EPIC 7 — Komponen Lanjutan (vendor MIT opsional + milik sendiri)

> Audit lengkap 2026-06-12 atas 78 vendor Vuexy + katalog KTUI/CSS Metronic. Prinsip keputusan:
> (1) tanpa jQuery, (2) lisensi MIT/BSD/Apache, (3) vendor berat = **entry opsional** (tidak dimuat
> default), (4) tolak yang tergantikan fitur native/punya sendiri.
> **Ditolak + alasan:** select2/bootstrap-select/daterangepicker/jquery.repeater/jstree/typeahead+bloodhound
> (butuh jQuery → pengganti non-jQuery dipilih); moment (→ Intl/date-fns bila perlu); numeral (→ Intl);
> fontawesome (sudah ada Tabler+Lucide); perfect-scrollbar (sudah CSS sendiri); notyf/notiflix/sweetalert2-basic
> (toast/confirm sendiri); spinkit (spinner CSS sendiri); animate.css/aos (transisi Tailwind);
> masonry (CSS grid); hammerjs, highlight.js, katex, plyr, i18next (pakai localization ASP.NET) — di luar scope template.

| ID | Item | Keputusan & Acceptance |
|----|------|---------------------|
| E7-01 ☑ | **Charts — ApexCharts** (MIT) | Halaman /Charts (4 chart); entry opsional `vendors/apexcharts`; chunk `libs/apexcharts` dipisah agar halaman lain tak menyeretnya; config via JSON (ramah CSP), warna ikut tema+dark |
| E7-02 ☑ | **Upload — dropzone milik sendiri** (native, bukan Dropzone.js) + styling token | Deviasi jujur: ditulis sendiri (drag+klik+hapus, multi-file) — zero-vendor, lebih ringan; demo di /Components |
| E7-03 ☑ | **Editor — Quill** (BSD-3) | Entry opsional `vendors/quill` + _overrides dark; demo di /Components |
| E7-04 ☑ | **Slider/Range — milik sendiri** (native `<input type=range>`, bukan noUiSlider) | Deviasi jujur: native + fill via `--p` + nilai live; zero-vendor; demo di /Components |
| E7-05 ☑ | **Drag & sort — SortableJS** (MIT) | Entry opsional `vendors/sortablejs`; demo list reorder di /Components |
| E7-06 ☑ | **Stepper/Wizard** — tulis sendiri | Komponen `.wizard-*` + handler `[data-wizard]`; demo wizard 3 langkah di /Components |
| E7-07 ☐ | **Clipboard** — Clipboard API native, helper kecil sendiri (`data-copy`) | BELUM — di luar scope sesi ini |
| E7-08 ☐ | **Calendar — FullCalendar** (MIT) | BELUM — di luar scope yang dipilih user |
| E7-09 ☐ | Carousel — **Swiper** (MIT); Maps — **Leaflet** (BSD-2); Tour — **Shepherd** (MIT); Kanban | Ditunda sampai ada kebutuhan project nyata (tercatat sebagai resep di README) |
| E7-10 ☑ | **Color picker — Pickr** (`@@simonwep/pickr`, MIT) | Tambahan di luar rencana awal (KTUI punya color-picker); entry opsional `vendors/pickr` + _overrides; demo di /Components |
| E7-11 ☑ | **Tier-1 primitif** (di luar rencana E7 awal): input-group/addon, list-group, custom option cards, OTP/PIN, stat card, avatar group+status, datatable ringan (sort/search/paginate sisi-klien) | Semua zero-vendor, token-driven (theme1/theme2/dark otomatis); demo di /Components |

## EPIC 8 — Halaman & Pola Aplikasi (P2)

> Referensi: Vuexy punya 13 halaman auth, wizard, 15 pages umum; Metronic punya account/auth/error set.

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E8-01 ☑ | **Halaman auth** (login, register, lupa password) — UI only, layout blank, siap disambungkan ke Identity | 3 halaman di 2 theme; form pakai komponen E6 + validasi E6-02 |
| E8-02 ☑ | **Halaman error** (404, 500) menggantikan Error.cshtml polos | Styled, tanpa layout app-shell, tombol kembali |
| E8-03 ☑ | **Halaman settings/profile** (pola umum CRUD: form + tabs + upload avatar) | 1 halaman contoh memakai komponen E6 |
| E8-04 ☑ | Dashboard charts demo (gabung E7-01) | `Dashboards/Metronic` (area+donut+…) & `Dashboards/Vuexy` (radialBar+…) masing-masing 3 `data-apexchart` hidup ✓ |
| E8-05 ☐ | Integrasi ASP.NET Identity (scaffold, opsional saat packaging) | Keputusan didokumentasikan; bukan blocker template |

## EPIC 9 — Komunikasi Data: Proto / gRPC (P2)

> **Selesai 2026-06-15** (rekomendasi pasca-EPIC-4). Satu `.proto` = sumber kebenaran → server C# +
> klien TypeScript di-generate, dipanggil React via gRPC-Web. Detail: `TEMPLATE.md §6`, README
> "Komunikasi data via gRPC / Proto".

| ID | Item | Acceptance Criteria |
|----|------|---------------------|
| E9-01 ☑ | `Libs/Contracts` (`Grpc.AspNetCore` + `Protos/greeter.proto`, `GrpcServices=Server`) → C# di-generate Grpc.Tools saat build (obj/, tak di-commit) | `dotnet build` menghasilkan `GreeterServiceBase`; namespace dari `csharp_namespace` ✓ |
| E9-02 ☑ | Server: `GreeterRpcService` + `Program.cs` `AddGrpc`/`UseGrpcWeb`/`MapGrpcService().EnableGrpcWeb()`; Portal refs `Grpc.AspNetCore.Web` | endpoint `/greeter.v1.GreeterService/SayHello` jalan via gRPC-Web ✓ |
| E9-03 ☑ | Klien TS: Buf (`@bufbuild/buf`+`protoc-gen-es` v2) `buf.yaml`/`buf.gen.yaml`/`pnpm buf:generate` → `Assets/gen` (di-commit); React `rpcdemo.tsx` (Connect-ES `createGrpcWebTransport` same-origin) + page `/RpcDemo` | typecheck + vite bundle + halaman 200 ✓ |
| E9-04 ☑ | Tahan rename `dotnet new`: `package` proto generik (`greeter.v1`, wire stabil) + `csharp_namespace` branded (ikut rename) | instance `-n Acme -a Web`: grep speca/portal=0, publish sukses, gRPC round-trip "Halo, Acme!" ✓ (`scripts/rpc-smoke.ts`) |
| E9-05 ☑ | Pola produksi: interceptor server (logging+auth, `GrpcLoggingInterceptor`) + interceptor klien (header `Authorization`) + **server-streaming** (`StreamTicks` → React live) + pemetaan error (`RpcException`→`ConnectError`) | terverifikasi: unary+auth echo "token diterima", 4 tick berurutan, `InvalidArgument` terpetakan, interceptor log muncul ✓ (`scripts/rpc-smoke.ts`) |
| E9-06 ☑ | Conditional content `--data-comm proto\|none`: symbol choice + computed `proto` + exclude bersyarat (`Libs/Contracts`, `Services`, `/RpcDemo`, `gen`, `buf.*`, `rpc-smoke`) + `#if (proto)` di Program.cs/csproj/slnx/smoke-test.mjs (source tetap valid: DefineConstants `proto` + komentar XML/JS) | terverifikasi DUA jalur: `none` → publish + smoke 14/14 + `/RpcDemo` 404 + 0 ref gRPC; default `proto` (+rename) → gRPC 3-assert + smoke 15/15 ✓. (Pertama kalinya E4-02 conditional content terbukti jalan.) |
| — | **Batas jujur:** gRPC-Web hanya unary + server-streaming; client/bidi-streaming tak didukung dari browser (butuh HTTP/2 penuh / WebSocket) — sengaja tak ditambahkan. Sisa npm `@bufbuild`/`@connectrpc` tetap di package.json saat `none` (JSON tak bisa dikondisikan) tapi tree-shaken. | tercatat |

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
