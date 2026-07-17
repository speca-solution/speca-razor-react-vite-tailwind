// Publish Portal self-contained (win-x64) ke resources sidecar Tauri desktop.
// Dipanggil otomatis oleh `tauri build` (beforeBuildCommand di Apps/Desktop/src-tauri/tauri.conf.json).
// Hasil: Apps/Desktop/src-tauri/resources/portal/ berisi Speca.Portal.exe + wwwroot/dist
// (dotnet publish Release juga menjalankan vite build — lihat README "Build & Publish").
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const csproj = path.join(root, 'Apps', 'Portal', 'Speca.Portal.csproj');
const out = path.join(root, 'Apps', 'Desktop', 'src-tauri', 'resources', 'portal');

console.log(`[desktop-sidecar] publish ${csproj}\n[desktop-sidecar] →       ${out}`);
rmSync(out, { recursive: true, force: true });

execSync(
  `dotnet publish "${csproj}" -c Release -r win-x64 --self-contained true -o "${out}" --nologo`,
  { stdio: 'inherit', cwd: root },
);

const exe = path.join(out, 'Speca.Portal.exe');
if (!existsSync(exe)) {
  console.error(`[desktop-sidecar] GAGAL: ${exe} tidak ditemukan setelah publish.`);
  process.exit(1);
}
console.log('[desktop-sidecar] OK — sidecar Portal siap dibundel.');
