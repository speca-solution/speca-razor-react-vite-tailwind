<#
.SYNOPSIS
  Build + publish + jalankan Speca.Portal mode PRODUCTION atas HTTPS di laptop.

.DESCRIPTION
  Hardening produksi sengaja membuat dua hal "menghalangi" uji lokal:
    - AllowedHosts produksi menolak Host asing (mis. localhost) -> HTTP 400.
    - Antiforgery Cookie.SecurePolicy=Always menolak koneksi non-SSL -> halaman form 500.
  Skrip ini menjalankan app atas HTTPS (memakai dev-cert .NET, CN=localhost) sehingga
  jalur produksi (cookie Secure, antiforgery, CSP nonce) benar-benar teruji.

  dotnet publish (Release) otomatis menjalankan Vite build via target ViteBuildProduction,
  jadi tidak ada langkah 'pnpm build' terpisah.

  Mode:
    A (default)   bind https://localhost:<Port> + override AllowedHosts=* (paling praktis).
                  Catatan: HSTS TIDAK muncul (HstsMiddleware mengecualikan localhost - by design).
    B (-Faithful) pakai AllowedHosts produksi asli; browse https://<HostName>:<Port>.
                  Menguji host-filtering + HSTS. Perlu entri hosts: '127.0.0.1 <HostName>'.
                  Browser memperingatkan sertifikat (dev-cert CN=localhost) - wajar, lanjutkan saja.

.PARAMETER Faithful   Pakai Mode B (uji AllowedHosts asli + HSTS).
.PARAMETER Port       Port HTTPS (default 5599).
.PARAMETER HostName   Host produksi untuk Mode B (default portal.domain.com; harus ada di
                      appsettings.Production.json -> AllowedHosts).
.PARAMETER SkipBuild  Lewati publish; pakai folder publish yang sudah ada (uji ulang cepat).
.PARAMETER PublishDir Folder output publish (default ./_pub).

.EXAMPLE
  ./scripts/run-prod.ps1
.EXAMPLE
  ./scripts/run-prod.ps1 -Faithful
.EXAMPLE
  ./scripts/run-prod.ps1 -Port 7443 -SkipBuild
#>
[CmdletBinding()]
param(
    [switch]$Faithful,
    [int]$Port = 5599,
    [string]$HostName = "portal.domain.com",
    [switch]$SkipBuild,
    [string]$PublishDir = "./_pub"
)

$ErrorActionPreference = "Stop"

function Set-OrRemoveEnv($name, $value) {
    if ($null -eq $value) { Remove-Item "Env:\$name" -ErrorAction SilentlyContinue }
    else { Set-Item "Env:\$name" $value }
}

# Repo root = induk folder scripts/
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
$csproj = "Apps/Portal/Speca.Portal.csproj"

# --- 1. Dev-cert HTTPS (read-only check; --trust hanya bila perlu) ---
Write-Host "[1/3] Memeriksa dev-cert HTTPS .NET..." -ForegroundColor Cyan
dotnet dev-certs https --check --trust | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      Dev-cert belum ada/terpercaya. Menjalankan 'dotnet dev-certs https --trust'" -ForegroundColor Yellow
    Write-Host "      (akan muncul dialog Windows -> klik Yes)" -ForegroundColor Yellow
    dotnet dev-certs https --trust
    if ($LASTEXITCODE -ne 0) { throw "Gagal membuat/mempercayai dev-cert HTTPS." }
}

# --- 2. Publish (sekaligus Vite build produksi) ---
if ($SkipBuild) {
    if (-not (Test-Path (Join-Path $PublishDir "Speca.Portal.dll"))) {
        throw "Tidak menemukan $PublishDir/Speca.Portal.dll. Jalankan tanpa -SkipBuild dulu."
    }
    Write-Host "[2/3] -SkipBuild: memakai publish yang ada di $PublishDir" -ForegroundColor Cyan
}
else {
    Write-Host "[2/3] dotnet publish (Release) -> $PublishDir  (sekaligus Vite build)..." -ForegroundColor Cyan
    if (Test-Path $PublishDir) { Remove-Item -Recurse -Force $PublishDir }
    dotnet publish $csproj -c Release -o $PublishDir --nologo
    if ($LASTEXITCODE -ne 0) { throw "dotnet publish gagal." }
}

# --- 3. Mode B: pastikan HostName menunjuk loopback ---
$browseHost = "localhost"
if ($Faithful) {
    $browseHost = $HostName
    $resolved = @()
    try { $resolved = [System.Net.Dns]::GetHostAddresses($HostName) | ForEach-Object { $_.IPAddressToString } } catch {}
    $isLoopback = $resolved | Where-Object { $_ -eq "127.0.0.1" -or $_ -eq "::1" }
    if (-not $isLoopback) {
        Write-Host ""
        Write-Host "  '$HostName' belum menunjuk ke laptop ini." -ForegroundColor Red
        Write-Host "  Tambahkan baris berikut ke C:\Windows\System32\drivers\etc\hosts (perlu Administrator):" -ForegroundColor Yellow
        Write-Host "      127.0.0.1   $HostName" -ForegroundColor White
        throw "Host '$HostName' tidak resolve ke loopback. Tambah entri hosts lalu jalankan lagi."
    }
}

# --- 4. Jalankan PRODUCTION atas HTTPS (env disimpan & dipulihkan agar sesi tak terkotori) ---
$old = @{
    ENV   = $env:ASPNETCORE_ENVIRONMENT
    URLS  = $env:ASPNETCORE_URLS
    HOSTS = $env:AllowedHosts
}
try {
    Set-OrRemoveEnv "ASPNETCORE_ENVIRONMENT" "Production"
    Set-OrRemoveEnv "ASPNETCORE_URLS" "https://localhost:$Port"
    if ($Faithful) { Set-OrRemoveEnv "AllowedHosts" $null }   # pakai AllowedHosts appsettings.Production.json
    else { Set-OrRemoveEnv "AllowedHosts" "*" }                # Mode A: terima localhost

    $url = "https://${browseHost}:$Port"
    Write-Host ""
    Write-Host "[3/3] PRODUCTION berjalan di $url" -ForegroundColor Green
    if ($Faithful) {
        Write-Host "      Mode B: AllowedHosts produksi asli + HSTS aktif (host non-localhost)." -ForegroundColor Green
        Write-Host "      Browser akan memperingatkan sertifikat (dev-cert CN=localhost) - lanjutkan saja." -ForegroundColor Yellow
    }
    else {
        Write-Host "      Mode A: AllowedHosts=* (localhost). HSTS tidak muncul (localhost dikecualikan by design)." -ForegroundColor Green
    }
    Write-Host "      Tekan Ctrl+C untuk berhenti." -ForegroundColor DarkGray
    Write-Host ""

    Push-Location $PublishDir
    try { dotnet Speca.Portal.dll }
    finally { Pop-Location }
}
finally {
    Set-OrRemoveEnv "ASPNETCORE_ENVIRONMENT" $old.ENV
    Set-OrRemoveEnv "ASPNETCORE_URLS" $old.URLS
    Set-OrRemoveEnv "AllowedHosts" $old.HOSTS
}
