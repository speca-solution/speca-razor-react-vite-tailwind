// Pemeriksa prasyarat — ADAPTIF terhadap isi instance: hanya memeriksa yang
// benar-benar dipakai (desktop dicek bila ada Apps/Desktop, mobile bila ada
// Apps/Mobile, proto bila ada buf.yaml). Jalankan: `pnpm doctor`.
//
// Tujuan: pengguna baru tahu PERSIS apa yang kurang dan perintah pemasangannya,
// tanpa harus membaca dokumentasi panjang atau menebak dari pesan error.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const has = (p) => existsSync(path.join(root, p));

const OK = '✓';
const NO = '✗';
const WARN = '!';

let hardFail = 0;
let softFail = 0;

/** Jalankan perintah versi; kembalikan output baris pertama atau null bila gagal. */
function probe(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' })
      .split('\n')[0]
      .trim();
  } catch {
    return null;
  }
}

/** Ambil angka mayor pertama dari string versi (mis. "v22.1.0" → 22). */
const major = (s) => Number((s ?? '').match(/(\d+)/)?.[1] ?? 0);

function check({ label, cmd, min, fix, required = true, detail }) {
  const out = probe(cmd);
  if (out === null) {
    console.log(`  ${required ? NO : WARN} ${label} — TIDAK ditemukan`);
    console.log(`      pasang: ${fix}`);
    required ? hardFail++ : softFail++;
    return;
  }
  if (min && major(out) < min) {
    console.log(`  ${required ? NO : WARN} ${label} — versi ${out} (< ${min} dibutuhkan)`);
    console.log(`      perbarui: ${fix}`);
    required ? hardFail++ : softFail++;
    return;
  }
  console.log(`  ${OK} ${label} — ${detail ?? out}`);
}

console.log('\nSPECA doctor — memeriksa prasyarat untuk fitur yang ada di project ini\n');

// ── Inti (selalu) ────────────────────────────────────────────────────────────
console.log('Inti (web):');
check({
  label: '.NET SDK 10',
  cmd: 'dotnet --version',
  min: 10,
  fix: 'https://dotnet.microsoft.com/download/dotnet/10.0',
});
check({
  label: 'Node.js 22+',
  cmd: 'node --version',
  min: 22,
  fix: 'https://nodejs.org (LTS) atau nvm',
});
check({
  label: 'pnpm 10+',
  cmd: 'pnpm --version',
  min: 10,
  fix: 'npm install -g pnpm',
});

// ── Proto / gRPC ─────────────────────────────────────────────────────────────
if (has('buf.yaml')) {
  console.log('\nKontrak data (proto/gRPC):');
  console.log(`  ${OK} buf + protoc-gen-es — dari node_modules (pnpm install)`);
  if (has('Apps/Mobile')) {
    check({
      label: 'protoc-gen-dart (klien Dart)',
      cmd: 'protoc-gen-dart --version',
      required: false,
      // Output versinya tak konsisten antar-platform → tampilkan status saja.
      detail: 'terpasang',
      fix: 'dart pub global activate protoc_plugin  (lalu pastikan ~/.pub-cache/bin atau %LOCALAPPDATA%\\Pub\\Cache\\bin ada di PATH)',
    });
  }
}

// ── Desktop (Tauri) ──────────────────────────────────────────────────────────
if (has('Apps/Desktop')) {
  console.log('\nDesktop (Tauri):');
  check({
    label: 'Rust (cargo)',
    cmd: 'cargo --version',
    required: false,
    fix: 'winget install Rustlang.Rustup   (lalu: rustup default stable-msvc)',
  });
  if (process.platform === 'win32') {
    console.log(`  ${WARN} MSVC C++ build tools — diperlukan Rust di Windows`);
    console.log('      pastikan Visual Studio punya workload "Desktop development with C++"');
  }
}

// ── Mobile (Flutter) ─────────────────────────────────────────────────────────
if (has('Apps/Mobile')) {
  console.log('\nMobile (Flutter):');
  check({
    label: 'Flutter SDK',
    cmd: 'flutter --version',
    required: false,
    fix: 'https://docs.flutter.dev/get-started/install (atau ekstrak SDK lalu tambahkan <sdk>/bin ke PATH)',
  });
  const androidHome = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;
  if (androidHome && existsSync(androidHome)) {
    console.log(`  ${OK} Android SDK — ${androidHome}`);
  } else {
    console.log(`  ${WARN} Android SDK — ANDROID_HOME belum di-set`);
    console.log('      pasang Android Studio ATAU cmdline-tools, lalu set ANDROID_HOME');
    softFail++;
  }
  console.log(`  ${WARN} Build iOS butuh macOS + Xcode (batasan Apple, bukan template)`);
}

// ── Ringkasan ────────────────────────────────────────────────────────────────
console.log('');
if (hardFail > 0) {
  console.log(`${NO} ${hardFail} prasyarat INTI belum terpenuhi — web belum bisa dijalankan.`);
  process.exit(1);
}
console.log(`${OK} Prasyarat inti lengkap — jalankan: dotnet run --project Apps/*/`);
if (softFail > 0) {
  console.log(
    `${WARN} ${softFail} prasyarat opsional belum ada (desktop/mobile). Web tetap jalan; ` +
      'pasang saat platform itu mulai dikerjakan.',
  );
}
console.log('');
