using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.FileProviders;
using Speca.Core.Helpers;
using Xunit;

// Cache manifest bersifat static — tes prod saling me-reset, jangan paralel.
[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace Speca.Core.Tests
{
    public class ViteTagHelperTests : IDisposable
    {
        private readonly string _tempRoot = Path.Combine(Path.GetTempPath(), $"speca-tests-{Guid.NewGuid():N}");

        public ViteTagHelperTests() => ViteManifest.Reset();

        public void Dispose()
        {
            ViteManifest.Reset();
            if (Directory.Exists(_tempRoot)) { Directory.Delete(_tempRoot, recursive: true); }
        }

        private sealed class FakeEnv : IWebHostEnvironment
        {
            public string EnvironmentName { get; set; } = "Production";
            public string ApplicationName { get; set; } = "Tests";
            public string WebRootPath { get; set; } = "";
            public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
            public string ContentRootPath { get; set; } = "";
            public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        }

        private static (string Html, TagHelperContext Context) Run(
            IWebHostEnvironment env, string src, TagHelperContext? context = null)
        {
            var helper = new ViteTagHelper(env) { Src = src };
            context ??= new TagHelperContext(
                new TagHelperAttributeList(), new Dictionary<object, object>(), "test");
            var output = new TagHelperOutput("vite-entry", new TagHelperAttributeList(),
                (_, _) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent()));

            helper.Process(context, output);
            return (output.Content.GetContent(), context);
        }

        private string WriteManifest(string json)
        {
            var distDir = Path.Combine(_tempRoot, "dist");
            Directory.CreateDirectory(distDir);
            File.WriteAllText(Path.Combine(distDir, "manifest.json"), json);
            return _tempRoot;
        }

        // ---- Development ----

        [Fact]
        public void Dev_StyleSource_RendersLinkWithLeadingSlash()
        {
            var env = new FakeEnv { EnvironmentName = "Development" };

            var (html, _) = Run(env, "Libs/UI/Assets/Themes/tailwind/theme.css");

            Assert.Contains("<link rel=\"stylesheet\" href=\"/dist/Libs/UI/Assets/Themes/tailwind/theme.css\" />", html);
            Assert.DoesNotContain("@react-refresh", html);
        }

        [Fact]
        public void Dev_Script_InjectsPreambleOnlyOnce()
        {
            var env = new FakeEnv { EnvironmentName = "Development" };
            var (first, context) = Run(env, "Apps/Portal/Assets/Entries/main.tsx");
            var (second, _) = Run(env, "Libs/UI/Assets/Themes/tailwind/app/layouts/layout.js", context);

            Assert.Contains("@react-refresh", first);
            Assert.Contains("/dist/@vite/client", first);
            Assert.Contains("src=\"/dist/Apps/Portal/Assets/Entries/main.tsx\"", first);

            Assert.DoesNotContain("@react-refresh", second);
            Assert.Contains("src=\"/dist/Libs/UI/Assets/Themes/tailwind/app/layouts/layout.js\"", second);
        }

        [Fact]
        public void Dev_NormalizesBackslashAndLeadingSlash()
        {
            var env = new FakeEnv { EnvironmentName = "Development" };

            var (html, _) = Run(env, "\\Libs\\UI\\x.css");

            Assert.Contains("href=\"/dist/Libs/UI/x.css\"", html);
        }

        // ---- Production (manifest) ----

        [Fact]
        public void Prod_JsEntry_RendersScriptAndItsCss()
        {
            var root = WriteManifest("""
                { "Apps/Portal/Assets/Entries/main.tsx":
                    { "file": "js/apps/portal-abc123.js", "css": ["css/apps/portal-def456.css"] } }
                """);
            var env = new FakeEnv { WebRootPath = root };

            var (html, _) = Run(env, "Apps/Portal/Assets/Entries/main.tsx");

            Assert.Contains("src=\"/dist/js/apps/portal-abc123.js\"", html);
            Assert.Contains("href=\"/dist/css/apps/portal-def456.css\"", html);
            Assert.DoesNotContain("@react-refresh", html);
        }

        [Fact]
        public void Prod_CssEntry_RendersLink()
        {
            var root = WriteManifest("""
                { "Libs/UI/Assets/Themes/tailwind/theme.css": { "file": "css/themes/tailwind-xyz.css" } }
                """);
            var env = new FakeEnv { WebRootPath = root };

            var (html, _) = Run(env, "Libs/UI/Assets/Themes/tailwind/theme.css");

            Assert.Contains("<link rel=\"stylesheet\" href=\"/dist/css/themes/tailwind-xyz.css\" />", html);
        }

        [Fact]
        public void Prod_MissingEntry_ThrowsWithHelpfulMessage()
        {
            var root = WriteManifest("{}");
            var env = new FakeEnv { WebRootPath = root };

            var ex = Assert.Throws<InvalidOperationException>(() => Run(env, "Apps/Tidak/Ada.tsx"));
            Assert.Contains("Apps/Tidak/Ada.tsx", ex.Message);
        }

        [Fact]
        public void Prod_MissingManifest_ThrowsFileNotFound()
        {
            Directory.CreateDirectory(_tempRoot);
            var env = new FakeEnv { WebRootPath = _tempRoot };

            Assert.Throws<FileNotFoundException>(() => Run(env, "Apps/Portal/Assets/Entries/main.tsx"));
        }

        [Fact]
        public void EmptySrc_RendersNothing()
        {
            var env = new FakeEnv { EnvironmentName = "Development" };

            var (html, _) = Run(env, "   ");

            Assert.Equal("", html);
        }
    }
}
