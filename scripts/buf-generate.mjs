// Generate klien dari .proto — TAHAN mesin yang belum lengkap.
//
// Masalah yang dipecahkan: klien Dart butuh `protoc-gen-dart` (di luar npm).
// Bila plugin itu digabung ke buf.gen.yaml, `pnpm buf:generate` GAGAL TOTAL di
// mesin yang belum memasangnya — termasuk yang cuma menggarap web. Di sini:
//   1) TypeScript selalu di-generate (plugin dari node_modules — pasti ada).
//   2) Dart di-generate HANYA bila Apps/Mobile ada DAN protoc-gen-dart tersedia;
//      bila tidak, tampilkan cara memasangnya lalu keluar SUKSES (tak memblokir).
import { execFileSync, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Pakai binary buf dari node_modules bila ada — supaya skrip tetap jalan saat
// dipanggil langsung `node scripts/buf-generate.mjs` (tanpa PATH dari pnpm).
const localBuf = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'buf.cmd' : 'buf');
const bufBin = existsSync(localBuf) ? localBuf : 'buf';
const run = (args) => execFileSync(bufBin, args, { stdio: 'inherit', cwd: root, shell: true });

// 1) TypeScript — selalu.
console.log('[buf] generate klien TypeScript…');
run(['generate']);

// 2) Dart — opsional.
const mobileDir = path.join(root, 'Apps', 'Mobile');
const dartTemplate = path.join(root, 'buf.gen.dart.yaml');
if (!existsSync(mobileDir) || !existsSync(dartTemplate)) {
  process.exit(0);
}

const hasDartPlugin = (() => {
  try {
    execSync('protoc-gen-dart --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

if (!hasDartPlugin) {
  console.warn(
    '\n[buf] LEWAT klien Dart: `protoc-gen-dart` tidak ditemukan di PATH.\n' +
      '      Klien TypeScript sudah ter-generate; Apps/Mobile memakai file gen\n' +
      '      yang sudah di-commit (tetap valid selama .proto belum berubah).\n' +
      '      Untuk mengaktifkan generate Dart:\n' +
      '        dart pub global activate protoc_plugin\n' +
      '        # lalu pastikan direktori bin pub-cache ada di PATH:\n' +
      '        #   Windows : %LOCALAPPDATA%\\Pub\\Cache\\bin\n' +
      '        #   macOS/Linux: $HOME/.pub-cache/bin\n',
  );
  process.exit(0);
}

console.log('[buf] generate klien Dart (Apps/Mobile)…');
run(['generate', '--template', 'buf.gen.dart.yaml']);
