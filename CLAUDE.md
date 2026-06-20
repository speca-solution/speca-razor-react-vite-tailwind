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
dotnet new speca-platform -n Acme -a Web -o <temp-path> --no-restore
dotnet build <temp-path>\Apps\Web\Acme.Web.csproj -c Debug --nologo
```

If a command cannot be run, say exactly why.

## Implementation Priorities

1. Preserve template correctness across rename, theme, data-comm, and auth options.
2. Keep production publish and smoke tests healthy.
3. Keep UI patterns consistent with existing Tailwind/theme/layout architecture.
4. Prefer documented, boring, maintainable code over clever abstractions.
5. Treat Visual Studio New Project solution-folder flattening as a known external limitation; do not keep trying to solve it inside template source unless new evidence appears.

