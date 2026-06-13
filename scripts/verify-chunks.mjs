// Verifikasi terukur: peta modul node_modules -> chunk berdasarkan moduleIds
// asli dari hasil build (bukan tebakan grep). Build in-memory (write:false).
import { build } from 'vite';

const out = await build({ logLevel: 'error', build: { write: false } });
const output = (Array.isArray(out) ? out[0] : out).output;

const pkgOf = (id) => {
    // Ambil paket setelah node_modules/ TERAKHIR (lewati virtual store .pnpm/<pkg@ver>/node_modules/).
    const norm = id.replace(/\\/g, '/');
    const idx = norm.lastIndexOf('node_modules/');
    if (idx === -1) return null;
    const rest = norm.slice(idx + 'node_modules/'.length);
    const m = rest.match(/^(@[^/]+\/[^/]+|[^/]+)/);
    return m ? m[1] : null;
};

const chunkPkgs = {};   // chunkName -> Set(pkg)
const pkgChunks = {};   // pkg -> Set(chunkName)

for (const c of output) {
    if (c.type !== 'chunk') continue;
    const name = c.fileName.replace(/-[A-Za-z0-9_]+\.js$/, '');
    for (const id of c.moduleIds || []) {
        if (!id.includes('node_modules')) continue;
        const pkg = pkgOf(id);
        if (!pkg) continue;
        (chunkPkgs[name] ??= new Set()).add(pkg);
        (pkgChunks[pkg] ??= new Set()).add(name);
    }
}

console.log('\n=== ISI TIAP CHUNK (paket node_modules) ===');
for (const [name, pkgs] of Object.entries(chunkPkgs).sort()) {
    console.log(`\n${name}:`);
    for (const p of [...pkgs].sort()) console.log(`   - ${p}`);
}

console.log('\n=== DUPLIKASI: paket yang muncul di >1 chunk ===');
let dup = false;
for (const [pkg, chunks] of Object.entries(pkgChunks).sort()) {
    if (chunks.size > 1) { dup = true; console.log(`   ! ${pkg} -> ${[...chunks].join(', ')}`); }
}
if (!dup) console.log('   (tidak ada — setiap paket hanya di satu chunk)');
