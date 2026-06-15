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
(`PackageType=Template`, membungkus root repo sebagai `content/`, mengecualikan `bin/obj/node_modules/dist/.git/.vs/_pub/certs/` + `wwwroot/assets/media`).

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
1. Struktur ter-rename: `Acme Platform.slnx`, `Apps/Web/Acme.Web.csproj`, `Acme.Core/UI/Core.Tests`, `Acme.Contracts`. ✓
2. `grep -ri speca` & `grep -riw portal` pada hasil = **0**. ✓
3. `dotnet publish -c Release` → vite build + compile + publish **sukses**. ✓
4. Jalankan hasil publish + `node scripts/smoke-test.mjs` → **15/15 halaman 200, CSP produksi bersih**. ✓
5. gRPC round-trip pada instance ter-rename: `node scripts/rpc-smoke.ts` → balasan typed, int64→bigint. ✓

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
