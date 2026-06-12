using Speca.UI.Navigation;
using Xunit;

namespace Speca.Core.Tests
{
    public class MenuItemTests
    {
        [Theory]
        [InlineData("/", "/", true)]
        [InlineData("/", "/Privacy", false)]            // "/" tidak pernah prefix-match
        [InlineData("/Products", "/Products", true)]
        [InlineData("/Products", "/products", true)]    // case-insensitive
        [InlineData("/Products/", "/Products", true)]   // trailing slash dinormalkan
        [InlineData("/Products", "/Products/123", false)] // exact default: anak TIDAK aktif
        public void IsActive_ExactMatch(string url, string path, bool expected)
        {
            var item = new MenuItem { Url = url };
            Assert.Equal(expected, item.IsActive(path));
        }

        [Theory]
        [InlineData("/Products", "/Products/123", true)]
        [InlineData("/Products", "/Products", true)]
        [InlineData("/Products", "/ProductsXyz", false)] // bukan segment boundary
        [InlineData("/", "/Privacy", false)]             // "/" tetap exact walau MatchPrefix
        public void IsActive_PrefixMatch(string url, string path, bool expected)
        {
            var item = new MenuItem { Url = url, MatchPrefix = true };
            Assert.Equal(expected, item.IsActive(path));
        }

        [Fact]
        public void HasActiveDescendant_FindsDeepChild()
        {
            var item = new MenuItem
            {
                Title = "L1",
                Children =
                [
                    new MenuItem
                    {
                        Title = "L2",
                        Children = [new MenuItem { Title = "L3", Url = "/deep/page" }],
                    },
                ],
            };

            Assert.True(item.HasActiveDescendant("/deep/page"));
            Assert.False(item.HasActiveDescendant("/lain"));
        }

        [Fact]
        public void HeadingAndNullUrl_NeverActive()
        {
            Assert.False(new MenuItem { IsHeading = true, Title = "X" }.IsActive("/"));
            Assert.False(new MenuItem { Title = "Induk" }.IsActive("/"));
        }
    }
}
