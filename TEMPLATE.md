# Speca Platform — Template `dotnet new`

Solution ini sekaligus berfungsi sebagai **project template** (`dotnet new`) sehingga bisa
di-instantiate menjadi solution baru dengan **nama solution** dan **nama project aplikasi**
yang berbeda — semua identitas (namespace, csproj, slnx, appsettings, package.json, env build,
prefix JS/CSS, cookie) ikut berganti secara konsisten.

Metadata template ada di [`.template.config/`](.template.config/):
- `template.json` — definisi parameter & aturan substitusi.
- `dotnetcli.host.json` — alias CLI (`--app-name` / `-a`).

---

## 1. Parameter

| Parameter | CLI | Default | Mengganti | Contoh hasil |
|-----------|-----|---------|-----------|--------------|
| Nama solution | `-n` / `--name` | `MyApp` | `Speca` (PascalCase) + `speca` (lowercase) + `SPECA`→tidak ada (sudah generik) | `Speca.Core` → `Acme.Core`, `@speca/platform` → `@acme/platform`, cookie `speca.antiforgery` → `acme.antiforgery` |
| Nama project app | `--app-name` / `-a` | `Portal` | `Portal` (PascalCase) + `portal` (lowercase) | folder `Apps/Portal` → `Apps/Web`, `Speca.Portal.csproj` → `Acme.Web.csproj`, `appsettings name` `speca.portal` → `acme.web` |
| Jalur data gRPC/Proto | `--data-comm` | `proto` | `proto` \| `none` | `none` = tanpa `Libs/Contracts`, server gRPC, & demo `/RpcDemo` (lihat §6) |
| Tema disertakan | `--theme` / `-t` | `both` | `both` \| `theme1` \| `theme2` | satu tema = file tema lain + dashboard-nya dibuang; `style.css` otomatis pakai tema terpilih |
| Auth + Data | `--auth` | `none` | `none` \| `identity` | `identity` = ASP.NET Identity + EF Core + Dapper (`Libs/Data`, SQLite, demo `/Products`); `none` = tanpa DB (halaman auth jadi mockup) |
| Cakupan konten | `--content` | `demo` | `demo` \| `starter` | `demo` = showcase lengkap; `starter` = ramping (Home sambutan + Dashboard + Account + Error/Privacy), halaman showcase & menu demo dibuang (lihat §7) |
| Lewati restore | `--no-restore` | `false` | — | tidak menjalankan `dotnet restore` otomatis |

> **Apa yang ikut berganti otomatis** (terverifikasi: `grep -ri speca|portal` pada hasil = **0**):
> nama & path csproj, `*.slnx`, `*.code-workspace`, namespace C# (`Speca.Core/UI/Portal`),
> `@using`/`@addTagHelper`, `AddSpecaMenu`/`UseSpecaSecurityHeaders`/`SpecaMenuOptions`,
> property MSBuild (`SpecaAppName`/`SpecaRootDir`), `appsettings.json`, `package.json`,
> **prefix milik sendiri di JS/CSS** (`specaToast`→`acmeToast`, `.speca-scroll`→`.acme-scroll`,
> key localStorage `speca-theme`→`acme-theme`), default app di `vite.config.ts`, CI workflow.
> Env var build internal sudah dibuat **generik** (`BUILD_APP_NAME`, bukan `SPECA_APP`) agar
> tidak ada sisa brand.

---

## 2. Cara pakai

### a. Install template (dari folder repo ini)

```bash
dotnet new install .
# update setelah ubah .template.config:
dotnet new install . --force
# lepas:
dotnet new uninstall "D:\PROJECTS\SPECA\TEMPLATE\Speca Platform"
```

Setelah install, template muncul di `dotnet new list` **dan** di dialog *New Project*
Visual Studio 2026 (VS membaca template `dotnet new` yang terpasang).

### b. Buat solution baru

```bash
# nama solution Acme, app default "Portal"
dotnet new speca-platform -n Acme

# nama solution Acme, project app diganti jadi "Web"
dotnet new speca-platform -n Acme --app-name Web

# tanpa restore otomatis
dotnet new speca-platform -n Toko.Online -a Storefront --no-restore
```

### c. Jalankan hasil

```bash
cd Acme
pnpm install          # (build pertama juga memicu `pnpm i` otomatis via target MSBuild)
dotnet run --project Apps/Web/Acme.Web.csproj
# atau buka *.slnx di VS 2026 → F5
```

> **Catatan nama dengan titik** (mis. `-n Toko.Online`): bagian lowercase dipakai untuk scope npm
> (`@toko.online/platform`). npm scope tidak mengizinkan titik — untuk hasil paling bersih pakai
> nama satu-kata (`Acme`, `Toko`) atau sesuaikan field `name` di `package.json` setelah instantiate.

---

## 3. Distribusi sebagai paket (opsional, untuk tim)

`dotnet new install .` cukup untuk pemakaian lokal. Untuk dibagikan via feed (NuGet privat /
GitHub Packages), project template-pack **sudah disediakan**: [`packaging/Speca.Templates.csproj`](packaging/Speca.Templates.csproj)
(`PackageType=Template`, membungkus root repo sebagai `content/`, mengecualikan `bin/obj/node_modules/dist/.git/.vs/_pub/certs/`).

```bash
dotnet pack packaging/Speca.Templates.csproj -o ./_nupkg
dotnet new install ./_nupkg/Speca.Templates.1.0.0.nupkg
# lalu seperti biasa:
dotnet new speca-platform -n Acme --app-name Web
```

**Terverifikasi:** pack → `.nupkg` **1,1 MB** (tanpa node_modules & demo-media) → `install` dari nupkg →
instantiate `-n FromPkg -a Web` → `publish -c Release` sukses → smoke **15/15** + gRPC round-trip. ✓
Naikkan `<PackageVersion>` tiap rilis. Distribusi: `dotnet nuget push` ke feed privat / GitHub Packages.

---

## 4. Apa yang **dikecualikan** dari hasil instantiate

Diatur di `template.json > sources.modifiers.exclude`:
`bin/`, `obj/`, `node_modules/`, `wwwroot/dist/`, `.vs/`, `.git/`, `_pub/`, `publish/`,
`certs/` (di-generate ulang oleh `vite.config`), `*.user`, `pnpm-lock.yaml`
(di-resolve ulang saat `pnpm i`), `BACKLOG.md` (dokumen internal pembuatan template), dan
`.template.config/` sendiri.

---

## 5. Verifikasi (yang sudah diuji)

Diuji dengan `-n Acme --app-name Web`:
1. Struktur ter-rename: `Acme.slnx` (solution, ber-folder), `Apps/Web/Acme.Web.csproj`, `Acme.Core/UI/Core.Tests`, `Acme.Contracts`. ✓
2. `grep -ri speca` & `grep -riw portal` pada hasil = **0**. ✓
3. `dotnet publish -c Release` → vite build + compile + publish **sukses**. ✓
4. Jalankan hasil publish + `node scripts/smoke-test.mjs` → **15/15 halaman 200, CSP produksi bersih**. ✓
5. gRPC round-trip pada instance ter-rename: `node scripts/rpc-smoke.ts` → balasan typed, int64→bigint. ✓
6. Matrix CLI tema×data-comm: `both/theme1/theme2` × `proto/none` (termasuk sudut theme1+none & theme2+none) → instantiate + build **sukses**, exclude benar. ✓

---

## 5b. Uji di Visual Studio 2026 (GUI) — checklist manual

Metadata GUI ada di [`.template.config/ide.host.json`](.template.config/ide.host.json) (label parameter).
Parameter `choice` (`--theme`, `--data-comm`) muncul sebagai **dropdown** di halaman *Additional information*.

**Langkah:**
1. Pasang template agar VS melihatnya: `dotnet new install .` (di root repo). VS 2022+/2026 membaca template `dotnet new` yang terpasang.
2. VS 2026 → **File → New → Project** → cari **"Speca Platform"** → **Next**.
3. **WAJIB centang "Place solution and project in the same directory"** (kalau tidak, VS membungkus
   solution → `package.json` ter-nesting & `pnpm i` gagal — lihat ⚠️ di bawah).
4. Halaman **Additional information**: isi **Nama project aplikasi**, pilih **Tema** (both/theme1/theme2) & **Jalur data gRPC/Proto** (proto/none) dari dropdown → **Create**.
5. **F5** → halaman ter-render (build pertama menjalankan `pnpm i` + `vite build` otomatis).
6. **Build → Publish** → publish sukses.

**Matrix yang diuji** (centang tiap kombinasi):

| Tema \ Data | `proto` | `none` |
|---|---|---|
| `both` | ☐ F5 ☐ publish | ☐ F5 ☐ publish |
| `theme1` | ☐ F5 ☐ publish | ☐ F5 ☐ publish |
| `theme2` | ☐ F5 ☐ publish | ☐ F5 ☐ publish |

> Keenam kombinasi sudah divalidasi **instantiate+build via CLI** (template & engine sama persis dengan
> yang dibaca VS) — uji GUI ini terutama mengonfirmasi **UX dialog + alur F5/Publish** di IDE.

**⚠️ Nesting di VS New Project.** VS bisa membungkus solution → membuat `Lokasi\Nama\Nama\` (isi solution
+ `package.json` ada di subfolder kedua) dan `.slnx` pembungkus sendiri di atas. Akibatnya `pnpm i` di root
atas gagal (`ERR_PNPM_NO_PKG_MANIFEST`). Cara menghindari:
> - **Centang "Place solution and project in the same directory"** di dialog New Project, **atau**
> - Instantiate via **CLI** (`dotnet new speca-platform -n MyApp`) — tidak pernah nesting.
>
> Walau ter-nesting, build tetap jalan: deteksi root vite pakai `$(MSBuildProjectDirectory)\..\..\`
> (relatif project, bukan `$(SolutionDir)`) sehingga selalu menemukan `package.json` yang benar.

**Solution Explorer ber-folder.** File solusi **`<Nama>.slnx`** mengelompokkan project ke **solution
folder** virtual (`Apps/`, `Libs/`, `Tests/`, `Solution Items/`) — tampil sebagai folder di Solution
Explorer (bukan folder disk).

> - Via **`dotnet new` CLI**: `<Nama>.slnx` langsung ber-folder. ✓
> - Via **VS New Project**: VS **meng-generate ulang** `<Nama>.slnx` miliknya secara **DATAR** (hanya
>   daftar project, tanpa folder) — ini perilaku VS yang tak bisa dikendalikan template. Untuk
>   mengelompokkan, tambah **Solution Folder** manual di Solution Explorer (kanan-klik Solution →
>   Add → New Solution Folder, lalu drag project) — sekali saja.
>
> (Nama `<Nama>.slnx` dipilih bersih sengaja; tidak memakai akhiran " Platform".)

---

## 6. Komunikasi data: Proto → gRPC (single source of truth)

Template menyertakan jalur **Protobuf/gRPC** yang sudah jalan end-to-end: satu file `.proto`
men-generate **server C#** dan **klien TypeScript** sekaligus — tidak ada DTO ditulis dua kali.

```
Libs/Contracts/Protos/greeter.proto   ← SUMBER KEBENARAN (satu file)
        │
        ├── Grpc.Tools (saat `dotnet build`) ──► C# (obj/, base class server)
        │       implementasi: Apps/<App>/Services/GreeterRpcService.cs
        │       dipetakan:    Program.cs → AddGrpc / UseGrpcWeb / MapGrpcService().EnableGrpcWeb()
        │
        └── Buf (`pnpm buf:generate`) ─────────► TypeScript (Apps/<App>/Assets/gen/greeter_pb.ts)
                klien React: Apps/<App>/Assets/Entries/rpcdemo.tsx (@connectrpc/connect-web)
                halaman:     /RpcDemo
```

**Kenapa gRPC-Web?** Browser tak bisa gRPC mentah. `Grpc.AspNetCore.Web` (server) + Connect-ES
`createGrpcWebTransport` (klien) berbicara **gRPC-Web same-origin** — di-izinkan CSP `connect-src 'self'`,
tanpa proxy tambahan.

**Konvensi penting (sengaja):**
- `package` proto **generik** (`greeter.v1`) → path wire `/greeter.v1.GreeterService/...` **stabil**,
  tidak ikut rename `dotnet new` → server & klien tetap sinkron di instance apa pun.
- `option csharp_namespace` **branded** (`Speca.Contracts.Greeter`) → ikut rename (khusus C#).
- TS hasil generate **di-commit** (`Assets/gen/`) supaya `dotnet build`/CI jalan tanpa wajib `buf` —
  regenerate kapan saja dengan `pnpm buf:generate`.

**Pola produksi yang sudah disertakan (bukan sekadar unary demo):**
- **Interceptor server** (`Services/GrpcLoggingInterceptor.cs`, didaftarkan di `AddGrpc(o => o.Interceptors…)`):
  logging lintas-cutting untuk semua method (unary + streaming) — method, status auth, durasi, error.
- **Interceptor klien** (`rpcdemo.tsx` / `rpc-smoke.ts`): menyisipkan header `Authorization` ke setiap
  panggilan; server membacanya via `context.RequestHeaders.GetValue("authorization")`.
- **Server-streaming** (`StreamTicks`): server `IServerStreamWriter`; klien `for await (… of client.streamTicks())`
  → update React live.
- **Pemetaan error**: server `throw new RpcException(new Status(StatusCode.InvalidArgument, …))`;
  klien `catch (ConnectError)` → `Code[e.code]` jadi pesan UI.

**Menambah RPC/method baru:**
1. Edit/ tambah `.proto` di `Libs/Contracts/Protos/`.
2. `pnpm buf:generate` (perbarui klien TS). C# otomatis saat build.
3. Implement method di service C#; panggil dari TS via client yang sama.

**Dependensi yang ditambahkan:** C# `Grpc.AspNetCore` (+`.Web`); npm `@bufbuild/protobuf`,
`@connectrpc/connect`, `@connectrpc/connect-web` (runtime) + `@bufbuild/buf`, `@bufbuild/protoc-gen-es` (dev).

**Menonaktifkan saat instantiate:** `dotnet new speca-platform -n Acme --data-comm none` → instance
**tanpa** `Libs/Contracts`, server gRPC, demo `/RpcDemo`, `Assets/gen`, `buf.*`, `rpc-smoke.ts`
(blok di `Program.cs`/`.csproj`/`.slnx`/`smoke-test.mjs` dilucuti otomatis lewat `#if (proto)`).
Terverifikasi: instance `none` publish + smoke 14/14, `/RpcDemo` → 404, nol referensi gRPC di kode.
*Catatan jujur:* paket npm `@bufbuild/*`/`@connectrpc/*` tetap tercantum di `package.json` (JSON tak
boleh komentar → tak bisa dikondisikan tanpa merusak file sumber); tidak di-bundle (tree-shaken karena
tak ada yang meng-import) — hapus manual bila ingin benar-benar bersih.

**Batas teknis (jujur):** gRPC-Web (protokol yang dipakai browser) **hanya** mendukung *unary* &
*server-streaming*. *Client-streaming* & *bidirectional-streaming* TIDAK bisa dari browser via gRPC-Web —
butuh gRPC HTTP/2 penuh (tak terjangkau `fetch`) atau transport berbasis WebSocket. Karena itu template
hanya menyertakan pola yang benar-benar jalan di browser.

## 7. Cakupan konten: `--content demo` vs `starter`

Dua varian dari **satu** template (default `demo`):

| | `demo` (default) | `starter` |
|---|---|---|
| Home (`/`) | Preview tema (iframe banding) | Sambutan ringkas + pintasan ke Dashboard/Login |
| Halaman showcase | Components, Charts, Tables, Calendar, Advanced, ReactDemo, RepeaterDemo, Layout2, Settings | **dibuang** |
| Dashboard tema | ada | **ada** (tetap, sebagai contoh dashboard) |
| Account / Error / Privacy | ada | ada |
| Menu sidebar | lengkap + seksi "Demo Menu" (multi-level/mega/badge) | ramping (Beranda, Dashboard, Auth, Error) |
| Komponen `Libs/UI` | tersedia | **tetap tersedia** (hanya halaman demo yang hilang) |

```bash
dotnet new speca-platform -n Acme --content starter
# kombinasikan dgn flag lain, mis. starter paling ramping:
dotnet new speca-platform -n Acme --content starter --data-comm none --theme theme2
```

**Cara kerja (jujur):** parameter `content` → computed `isStarter`. Halaman showcase di-*exclude*
template engine; menu showcase di `Program.cs` dilucuti via `#if (!isStarter)` (engine mengevaluasi
simbol & menghapus directive saat instantiate). Flag runtime `Speca.Core.BuildFlags.IsStarter`
(di `Libs/Core`, terlihat oleh app & `Libs/UI`) dipakai view untuk mengganti isi Home dan
menyembunyikan tautan ke halaman yang dibuang (mis. `/Settings` di header & bottom-nav). `--content`
**ortogonal** terhadap `--auth`/`--data-comm`/`--theme` — bebas dikombinasikan.

Terverifikasi: instance `starter` & `demo` keduanya publish Release + smoke **lulus**; starter tanpa
halaman showcase & nol tautan mati; demo utuh; SOURCE repo (= demo) build 0 error.
