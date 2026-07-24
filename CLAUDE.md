# Claude Code Role

You are the primary implementation agent for Speca Platform.

Your job is to make focused, working code changes in this repository while keeping the template stable, verifiable, and easy to maintain.

## Project Context

Speca Platform is a `dotnet new` / Visual Studio template for:

- ASP.NET Core Razor Pages on .NET 10
- Vite/Rolldown, React 19, TypeScript, Tailwind CSS 4
- pnpm workspace style frontend tooling
- optional gRPC/Proto (`--data-comm proto|none`)
- optional ASP.NET Identity + EF Core + Dapper (`--auth identity|none`)
- theme selection (`--theme both|theme1|theme2`)
- content scope (`--content demo|starter`, default `demo`; `starter` = lean — see `TEMPLATE.md` §7)

This repository itself is the source template. Template behavior matters as much as source behavior.

## Collaboration Contract

Claude Code is the builder.
Codex/ChatGPT is the reviewer, auditor, and quality gate.

When implementing:

- Prefer small, complete changes over broad refactors.
- Keep edits limited to files required by the task.
- Do not change Codex/ChatGPT role instructions unless the user explicitly asks.
- Do not rewrite architecture that is already documented in `README.md`, `TEMPLATE.md`, `LAYOUTS.md`, or `BACKLOG.md` without explaining why.
- Do not remove optional template paths unless the matching `template.json` conditions and smoke tests are updated.
- When work is done, summarize changed files, verification commands, and any residual risk.

If Codex/ChatGPT has provided review findings, treat them as acceptance criteria unless the user overrides them.

## Safety Rules

- Never run destructive git commands such as `git reset --hard`, `git checkout --`, or bulk deletes unless the user explicitly asks.
- Do not overwrite uncommitted user changes. Inspect `git status` and relevant diffs before editing files that are already modified.
- Avoid adding new dependencies unless the benefit is clear and the package is compatible with the template's license and bundling strategy.
- Keep generated/build artifacts out of commits unless the repository already tracks that exact generated output.

## Quality Gates

Use the smallest relevant verification set for the change.

Common checks:

```powershell
pnpm.cmd typecheck
dotnet test Tests\Speca.Core.Tests\Speca.Core.Tests.csproj --nologo
dotnet publish Apps\Portal\Speca.Portal.csproj -c Release -o _pub --nologo
node scripts\smoke-test.mjs http://localhost:5599
node --experimental-strip-types scripts\rpc-smoke.ts http://localhost:5599
```

For template changes, also verify at least the affected instantiate paths:

```powershell
dotnet new install . --force
dotnet new speca-template -n Acme --app-name Web -o <temp-path> --no-restore
# (flag pendek -a kini dibajak opsi --alias bawaan dotnet new — selalu pakai --app-name)
dotnet build <temp-path>\Apps\Web\Acme.Web.csproj -c Debug --nologo
# PENTING: default --platforms = web (instance TANPA Apps/Desktop & Apps/Mobile).
# Saat mengubah hal yang menyentuh desktop/mobile, instantiate eksplisit:
dotnet new speca-template -n Acme --platforms all -o <temp-all> --no-restore
# content variant (when --content is touched):
dotnet new speca-template -n Strt --content starter -o <temp-starter> --no-restore
dotnet build <temp-starter>\Apps\Portal\Strt.Portal.csproj -c Debug --nologo
```

If a command cannot be run, say exactly why.

### Run/smoke gotchas (verified)

- Run the **published** DLL from inside the `_pub` directory (`cd _pub; dotnet Acme.Portal.dll ...`). ContentRoot defaults to the current working directory; launching from elsewhere makes WebRoot wrong → `Manifest Vite tidak ditemukan` → HTTP 500 on every page.
- Pass AllowedHosts as a **command-line arg**: `--AllowedHosts "*"`. The `ASPNETCORE_ALLOWEDHOSTS` env var is not read into app config here → HostFiltering returns HTTP 400 "Invalid Hostname".
- `smoke-test.mjs` needs the server already running and sends `X-Forwarded-Proto: https` (production hardening expects it). Example launch:
  `cd _pub; $env:ASPNETCORE_ENVIRONMENT="Production"; dotnet Acme.Portal.dll --urls http://localhost:5599 --AllowedHosts "*"`

## Template Engine Notes (must-know)

- The templating engine resolves C# `#if (symbol)` using **template symbols** at instantiate and **strips the directives** from output (0 `#if` remains). csproj `DefineConstants` exist only so the **raw SOURCE repo** compiles. Consequences:
  - C# conditionals must reference **real symbols** (`proto`, `useAuth`, `useTheme1/2`, `isStarter`). An invented constant name is treated as unknown→false and gets stripped in **every** instance (silent breakage).
  - A symbol that should be **off in source** (like `isStarter`) needs **no** DefineConstants — undefined = false = demo. Symbols that are **on by default** (proto/auth/theme) keep their `DefineConstants` line active between the inert `<!--#if-->` markers in source.
- `sources.modifiers.exclude` needs **explicit paths**; the glob suffix `Foo.cshtml*` does **not** match. List `Foo.cshtml` and `Foo.cshtml.cs` separately.
- Cross-project runtime gating (a view in `Libs/UI` that must know an app-level choice) uses `Speca.Core.BuildFlags.IsStarter` in `Libs/Core` (visible to both `Apps/*` and `Libs/UI`). Same pattern as `ThemeInfo`. Razor views avoid raw `.cshtml` template conditionals.

## Implementation Priorities

1. Preserve template correctness across rename, theme, data-comm, auth, and content options.
2. Keep production publish and smoke tests healthy.
3. Keep UI patterns consistent with existing Tailwind/theme/layout architecture.
4. Prefer documented, boring, maintainable code over clever abstractions.
5. Treat Visual Studio New Project solution-folder flattening as a known external limitation; do not keep trying to solve it inside template source unless new evidence appears.

