using QrPortal.Domain.Common;
using QrPortal.Domain.Menus;

namespace QrPortal.UnitTests;

public sealed class DomainRulesTests
{
    [Theory]
    [InlineData("Café do João", "cafe-do-joao")]
    [InlineData("  Minha--Loja  ", "minha-loja")]
    [InlineData("Açaí & Cia", "acai-cia")]
    public void Slug_is_normalized(string input, string expected)
        => Assert.Equal(expected, Slug.Normalize(input));

    [Theory]
    [InlineData("api")]
    [InlineData("m")]
    [InlineData("ab")]
    public void Reserved_or_short_slug_is_rejected(string input)
        => Assert.Throws<DomainException>(() => Slug.Normalize(input));

    [Fact]
    public void Promotional_price_cannot_be_greater_than_regular_price()
        => Assert.Throws<DomainException>(() => new Product(Guid.CreateVersion7(), "Prato", null, 20m, 21m, 0));

    [Fact]
    public void Product_rounds_prices_to_two_decimal_places()
    {
        var product = new Product(Guid.CreateVersion7(), "Prato", null, 20.126m, 18.555m, 0);

        Assert.Equal(20.13m, product.Price);
        Assert.Equal(18.56m, product.PromotionalPrice);
    }

    [Fact]
    public void Publishing_requires_a_confirmed_email()
    {
        var menu = MenuWithAvailableProduct();

        var exception = Assert.Throws<DomainException>(() => menu.Publish(emailConfirmed: false));

        Assert.Contains("Confirme", exception.Message);
    }

    [Fact]
    public void Publishing_requires_an_active_category_with_available_product()
    {
        var menu = new Menu(Guid.CreateVersion7(), "Almoço", "almoco");

        Assert.Throws<DomainException>(() => menu.Publish(emailConfirmed: true));
    }

    [Fact]
    public void Valid_menu_can_be_published()
    {
        var menu = MenuWithAvailableProduct();

        menu.Publish(emailConfirmed: true);

        Assert.Equal(MenuStatus.Published, menu.Status);
        Assert.NotNull(menu.PublishedAt);
    }

    [Fact]
    public void Theme_normalizes_hex_colors()
    {
        var theme = MenuTheme.CreateDefault(Guid.CreateVersion7());

        theme.Update("dark", "#aabbcc", "#123456", "#ffffff", "rounded");

        Assert.Equal("#AABBCC", theme.PrimaryColor);
        Assert.Equal("#FFFFFF", theme.BackgroundColor);
    }

    private static Menu MenuWithAvailableProduct()
    {
        var menu = new Menu(Guid.CreateVersion7(), "Almoço", "almoco");
        var category = new MenuCategory(menu.Id, "Pratos", null, 0);
        category.Products.Add(new Product(category.Id, "Executivo", null, 29.9m, null, 0));
        menu.Categories.Add(category);
        return menu;
    }
}
