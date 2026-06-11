using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Hosting;
using System.Text;
using System.Text.Json;

namespace Speca.Core.Helpers
{
    /// <summary>
    /// Loader manifest Vite (wwwroot/dist/.vite/manifest.json).
    /// Manifest adalah satu-satunya sumber kebenaran nama file produksi —
    /// entry yang tidak ditemukan langsung melempar exception (fail fast),
    /// bukan 404 diam-diam di browser.
    /// </summary>
    internal static class ViteManifest
    {
        private sealed record Entry(string File, IReadOnlyList<string> Css);

        private static Dictionary<string, Entry>? _entries;
        private static readonly object SyncLock = new();

        /// <summary>Kosongkan cache manifest — dipakai unit test.</summary>
        internal static void Reset()
        {
            lock (SyncLock)
            {
                _entries = null;
            }
        }

        public static (string File, IReadOnlyList<string> Css) Resolve(IWebHostEnvironment env, string src)
        {
            if (_entries is null)
            {
                lock (SyncLock)
                {
                    _entries ??= Load(env);
                }
            }

            if (!_entries.TryGetValue(src, out var entry))
            {
                throw new InvalidOperationException(
                    $"Entry '{src}' tidak ada di manifest Vite. " +
                    "Pastikan path persis sama dengan path sumber relatif solution (forward slash), " +
                    "file terdaftar sebagai entry di vite.config.ts, dan 'pnpm build' sudah dijalankan.");
            }

            return (entry.File, entry.Css);
        }

        private static Dictionary<string, Entry> Load(IWebHostEnvironment env)
        {
            var manifestPath = Path.Combine(env.WebRootPath ?? "", "dist", "manifest.json");
            if (!File.Exists(manifestPath))
            {
                throw new FileNotFoundException(
                    $"Manifest Vite tidak ditemukan di '{manifestPath}'. Jalankan 'pnpm build' (atau publish Release).",
                    manifestPath);
            }

            using var stream = File.OpenRead(manifestPath);
            using var doc = JsonDocument.Parse(stream);

            var entries = new Dictionary<string, Entry>(StringComparer.OrdinalIgnoreCase);
            foreach (var prop in doc.RootElement.EnumerateObject())
            {
                var file = prop.Value.TryGetProperty("file", out var f) ? f.GetString() : null;
                if (string.IsNullOrEmpty(file)) continue;

                var css = new List<string>();
                if (prop.Value.TryGetProperty("css", out var cssArray) && cssArray.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in cssArray.EnumerateArray())
                    {
                        var value = item.GetString();
                        if (!string.IsNullOrEmpty(value)) css.Add(value);
                    }
                }

                entries[prop.Name] = new Entry(file, css);
            }

            return entries;
        }
    }

    /// <summary>
    /// Tag helper aset Vite. Satu atribut untuk dev dan produksi:
    ///   &lt;vite-entry src="Apps/Portal/Assets/Entries/main.tsx" /&gt;
    /// Development : URL /dist/{src} di-proxy ke Vite dev server (plus preamble HMR React, sekali per halaman).
    /// Production  : nama file (ber-hash) di-resolve dari manifest; CSS milik entry ikut dirender sebagai &lt;link&gt;.
    /// </summary>
    [HtmlTargetElement("vite-entry", Attributes = "src")]
    [HtmlTargetElement("vite-asset", Attributes = "src")]
    public class ViteTagHelper(IWebHostEnvironment env) : TagHelper
    {
        private static readonly string[] StyleExtensions = [".css", ".scss", ".sass"];

        [HtmlAttributeName("src")]
        public string Src { get; set; } = "";

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = null;

            if (string.IsNullOrWhiteSpace(Src))
            {
                output.SuppressOutput();
                return;
            }

            var src = Src.Replace('\\', '/').TrimStart('/');
            var sb = new StringBuilder();

            if (env.IsDevelopment())
            {
                var isStyle = StyleExtensions.Any(ext => src.EndsWith(ext, StringComparison.OrdinalIgnoreCase));

                if (!isStyle && !context.Items.ContainsKey("ViteScriptsInjected"))
                {
                    sb.AppendLine("<script type=\"module\">");
                    sb.AppendLine("  import RefreshRuntime from '/dist/@react-refresh'");
                    sb.AppendLine("  RefreshRuntime.injectIntoGlobalHook(window)");
                    sb.AppendLine("  window.$RefreshReg$ = () => {}");
                    sb.AppendLine("  window.$RefreshSig$ = () => (type) => type");
                    sb.AppendLine("  window.__vite_plugin_react_preamble_installed__ = true");
                    sb.AppendLine("</script>");
                    sb.AppendLine("<script type=\"module\" src=\"/dist/@vite/client\"></script>");
                    context.Items["ViteScriptsInjected"] = true;
                }

                if (isStyle)
                {
                    sb.AppendLine($"<link rel=\"stylesheet\" href=\"/dist/{src}\" />");
                }
                else
                {
                    sb.AppendLine($"<script type=\"module\" src=\"/dist/{src}\"></script>");
                }
            }
            else
            {
                var (file, css) = ViteManifest.Resolve(env, src);

                foreach (var cssFile in css)
                {
                    sb.AppendLine($"<link rel=\"stylesheet\" href=\"/dist/{cssFile}\" />");
                }

                if (file.EndsWith(".css", StringComparison.OrdinalIgnoreCase))
                {
                    sb.AppendLine($"<link rel=\"stylesheet\" href=\"/dist/{file}\" />");
                }
                else
                {
                    sb.AppendLine($"<script type=\"module\" src=\"/dist/{file}\"></script>");
                }
            }

            output.Content.SetHtmlContent(sb.ToString());
        }
    }
}
