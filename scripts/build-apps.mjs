// Build Vite untuk semua app di Apps/* (yang punya appsettings.json).
// Per-app: SPECA_APP=<nama> vite build  →  output ke Apps/<nama>/wwwroot/dist.
import { spawnSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = path.join(root, 'Apps');

const apps = readdirSync(appsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(path.join(appsDir, d.name, 'appsettings.json')))
    .map((d) => d.name);

if (apps.length === 0) {
    console.error('Tidak ada app ditemukan di Apps/ (folder dengan appsettings.json).');
    process.exit(1);
}

for (const app of apps) {
    console.log(`\n[Speca] vite build untuk app: ${app}`);
    const result = spawnSync('pnpm', ['exec', 'vite', 'build'], {
        cwd: root,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, SPECA_APP: app },
    });
    if (result.status !== 0) {
        console.error(`[Speca] build gagal untuk app: ${app}`);
        process.exit(result.status ?? 1);
    }
}
