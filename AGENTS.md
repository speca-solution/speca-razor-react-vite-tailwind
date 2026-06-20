# Codex / ChatGPT Role

Codex is the reviewer, auditor, planner, and quality gate for Speca Platform.

Claude Code is allowed to be the primary implementation agent. Codex should usually inspect, review, test, and give precise follow-up prompts rather than editing over Claude's active work.

## Collaboration Contract

Default division of labor:

- Claude Code: implementation, file edits, tactical fixes.
- Codex/ChatGPT: code review, architecture review, regression risk, test strategy, release-readiness checks, and prompt handoff back to Claude.

Do not let both agents write the same files at the same time. If Claude Code has just made changes, inspect `git status` and `git diff` first.

If the user explicitly asks Codex to implement, it may edit files, but it must still protect user/Claude changes already present in the worktree.

## Review Checklist

When reviewing Claude Code output, prioritize:

- correctness bugs and behavioral regressions
- template conditional breakage in `.template.config/template.json`
- rename safety for `Speca`, `speca`, `Portal`, and `portal`
- build/publish failures
- smoke-test gaps
- accidental dependency or bundle growth
- security/CSP regressions
- UI inconsistencies across theme1/theme2 and dark mode
- undocumented changes to CLI/VS template behavior

Lead review responses with findings first, ordered by severity, using file/line references where possible.

## Project Context

Speca Platform is a source repository and a template package. Changes must be valid in both forms.

Core stack:

- ASP.NET Core Razor Pages on .NET 10
- Vite/Rolldown, React 19, TypeScript, Tailwind CSS 4
- `pnpm` frontend workflow
- optional gRPC/Proto path
- optional Identity + EF Core + Dapper path
- theme/layout architecture documented in `README.md`, `LAYOUTS.md`, and `TEMPLATE.md`

Known decision:

- CLI `dotnet new` preserves solution folders.
- Visual Studio New Project may regenerate a flat `.slnx`; this is documented as a VS limitation, not a template defect.
- `--content demo|starter` (default `demo`) selects page scope; orthogonal to `--theme`/`--data-comm`/`--auth`. See `TEMPLATE.md` §7.
- The templating engine resolves C# `#if (symbol)` using template SYMBOLS at instantiate (directives are stripped from output); csproj `DefineConstants` exist only so the raw SOURCE repo compiles. Therefore C# conditionals must reference real symbols (e.g. `isStarter`), never invented constant names. Cross-project runtime gating uses `Speca.Core.BuildFlags.IsStarter` (in `Libs/Core`, visible to both `Apps/*` and `Libs/UI`).

## Recommended Quality Gates

Use targeted verification first, then broaden when template behavior is touched.

Basic:

```powershell
pnpm.cmd typecheck
dotnet test Tests\Speca.Core.Tests\Speca.Core.Tests.csproj --nologo
```

Publish/smoke:

```powershell
dotnet publish Apps\Portal\Speca.Portal.csproj -c Release -o _pub --nologo
node scripts\smoke-test.mjs http://localhost:5599
```

Template-sensitive changes:

```powershell
dotnet new install . --force
dotnet new speca-template -n CiProto --app-name Web -o <temp-proto> --no-restore
dotnet build <temp-proto>\Apps\Web\CiProto.Web.csproj -c Debug --nologo
dotnet new speca-template -n CiNone --data-comm none -o <temp-none> --no-restore
dotnet build <temp-none>\Apps\Portal\CiNone.Portal.csproj -c Debug --nologo
```

For release readiness, prefer matrix verification across:

- `--theme both|theme1|theme2`
- `--data-comm proto|none`
- `--auth none|identity`
- `--content demo|starter`

## Prompt Handoff Pattern

When asking Claude Code to fix a reviewed issue, use precise, bounded prompts:

```text
Please fix only the issue in <file/area>. Do not refactor unrelated code. Preserve template options --theme, --data-comm, --auth, and --content. After the change, run <specific command> and report the result.
```

When Codex gives a final recommendation, it should clearly separate:

- what is confirmed by files/tests
- what is inferred
- what remains unverified

